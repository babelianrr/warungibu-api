/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import fs from 'fs';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { formatToTimeZone } from 'date-fns-timezone';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { FirebaseAdmin } from 'src/clients/firebase';
import { SendGrid } from 'src/clients/sendgrid/sendgrid';
import { GOOGLE_CLIENT_ID, JWT_SECRET } from 'src/config';
import xlsx from 'xlsx';
import { IQueryUsers, IRegisterUser, UserRepository } from 'src/libs/database/repository/user';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorMessages } from 'src/libs/error_message';
import { ELoginProvider, ERoleStatus, Users } from 'src/models/Users';
import { OrderRepository } from 'src/libs/database/repository/order';
import { OrderStatuses } from 'src/models/orders';
import { OutletTypes } from 'src/models/Outlet-types';
import { OutletTypesRepository } from 'src/libs/database/repository/outlet_types';
import { OutletAddressService } from './outlet-address';
import { OutletService } from './outlets';

export interface ILoginEmail {
    email: string;
    password: string;
}

export interface ILoginPhone {
    phone_number: string;
    password: string;
}

export interface ILoginGoogle {
    token: string;
}

export interface IPayloadAuthData {
    email?: string;
    id?: string;
}

export interface IUpdatePassword extends IPayloadAuthData {
    old_password: string;
    new_password: string;
}

export interface IUpdatePin extends IPayloadAuthData {
    old_pin: string;
    new_pin: string;
}

interface IResetPasswordData {
    token: string;
    new_password: string;
    confirmation_password: string;
}

interface IResetPinData {
    token: string;
    new_pin: string;
    confirmation_pin: string;
}

export interface IDnrCustomerData {
    kdcab: string;
    kdcust: string;
    custname: string;
    custgrp: string;
    top: any;
    credit_limit: string;
    alamat: string;
    city: string;
    tgl_create: string;
    tgl_update: string;
    status_blokir: string;
    no_hp: string;
    izin_cust: string;
    tgl_izin: string;
    izin_apj: string;
    tgl_izin_apj: string;
    tgl_data: string;
}

export interface IUserService {
    register(payload: IRegisterUser): Promise<any>;
    loginEmail(payload: ILoginEmail): Promise<any>;
    loginPhone(payload: ILoginPhone): Promise<any>;
    updatePassword(payload: IUpdatePassword): Promise<any>;
    updatePinForUser(payload: IUpdatePin): Promise<any>;
    addPinForUser(payload: any): Promise<any>;
    compareHasPassword(plainPass: string, hash: string): Promise<boolean>;
    getUserInfo(payload: IPayloadAuthData, id: string): Promise<any>;
    getUserById(id?: string): Promise<Users>;
    updateUserInfo(payload: any): Promise<any>;
    updateUserRole(payload: any): Promise<any>;
    updateUserCustomerId(noref_dplus: string, customerId: string): Promise<any>;
    updateUserProfilePicture(authInfo: IPayloadAuthData, payload: any): Promise<any>;
    verifiedEmailToken(email: string, token: string): Promise<any>;
    resendEmailVerification(email: string): Promise<void>;
    checkUserVerification(userId: string): Promise<boolean>;
    sendChat(id: string, text: string): Promise<void>;
    getAllUser(query: IQueryUsers): Promise<Users[]>;
    countAll(query?: IQueryUsers, payload?: any): Promise<any>;
    countAll(query?: IQueryUsers, payload?: any): Promise<any>;
    sendChatForAdmin(admin: { id: string; email: string }, userId: string, text: string): Promise<any>;
    updateReadChat(userId: string, userLoginId: string): Promise<any>;
    requestPasswordReset(email: string): Promise<boolean>;
    requestPinReset(email: string): Promise<boolean>;
    resetPassword(resetPasswordData: IResetPasswordData): Promise<Users>;
    resetPin(resetPasswordData: IResetPinData): Promise<Users>;
    importExcelUser(payload: Express.Multer.File): Promise<any>;
    setUsersLoanLimit(client_id: string, loan_limit: number): Promise<any>;
    getAllUserNoFilter(query: IQueryUsers): Promise<Users[]>;
    getClient(id: string): Promise<OutletTypes>;
}

export class UserService implements IUserService {
    private userRepo: UserRepository;

    hashSalt: number;

    jwtSecret: string;

    googleClient: OAuth2Client;

    sendGrid: SendGrid;

    outletService: OutletService;

    outletAddressService: OutletAddressService;

    outletTypeService: OutletTypesRepository;

    fireBase: FirebaseAdmin;

    orderRepo: OrderRepository;

    constructor(
        userRepo: UserRepository,
        outletService: OutletService,
        outletAddressService: OutletAddressService,
        outletTypeService: OutletTypesRepository,
        sendGrid: SendGrid,
        fireBase: FirebaseAdmin,
        orderRepo: OrderRepository
    ) {
        this.userRepo = userRepo;
        this.outletService = outletService;
        this.hashSalt = 10;
        this.jwtSecret = JWT_SECRET;
        this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
        this.outletAddressService = outletAddressService;
        this.sendGrid = sendGrid;
        this.fireBase = fireBase;
        this.outletTypeService = outletTypeService;
        this.orderRepo = orderRepo;
    }

    async register(payload: IRegisterUser) {
        try {
            const phoneExist = await this.userRepo.findUserByData(`+62${payload.phone_number}`, 'phone_number');
            const emailExist = await this.userRepo.findUserByData(payload.email, 'email');

            if (emailExist || phoneExist) {
                throw new ErrorObject('400', 'Phone number or email already exists', {
                    email: payload.email,
                    phone_number: payload.phone_number
                });
            }

            if (payload.outlet_types_id !== null) {
                const client = await this.outletTypeService.findOne(payload.outlet_types_id);

                if (!client) {
                    payload.loan_limit = 0;
                }

                payload.loan_limit = client.loan_limit;
                payload.loan_level = client.loan_limit;
            }

            if (payload.role_status === ERoleStatus.ADMIN) {
                payload.password = await this.hashPassword(payload.password);
            }

            if (payload.role_status === ERoleStatus.UNVERIFIED_USER) {
                payload.password = await this.hashPassword(`0${payload.phone_number}`);
                payload.phone_number = `+62${payload.phone_number}`;
            }

            payload.verification_token = String(Math.floor(Math.random() * (999999 - 100000) + 100000));

            const user = await this.userRepo.save(payload, { reload: true });
            const token = this.generateJWTTokenUser(user);

            return {
                user,
                token,
                refresh_token: token
            };
        } catch (error) {
            if (
                error.message &&
                error.message.includes('duplicate key value violates unique constraint "users_email_key"')
            ) {
                throw new ErrorObject(ErrorCodes.CAN_NOT_REGISTER, ErrorMessages.EMAIL_ALREADY_EXIST, error);
            }
            throw new ErrorObject(ErrorCodes.CAN_NOT_REGISTER, ErrorMessages.CAN_NOT_REGISTER, error);
        }
    }

    async loginEmail(payload: ILoginEmail) {
        try {
            const user = await this.userRepo.findUserByData(payload.email, 'email');
            if (user !== null) {
                const match = await this.compareHasPassword(payload.password, user.password);
                if (match) {
                    if (user.role_status === ERoleStatus.UNVERIFIED_USER) {
                        throw new ErrorObject('400', 'User is not activated. Please contact administrator');
                    }

                    const token = this.generateJWTTokenUser(user);
                    delete user.password;
                    delete user.pin;
                    delete user.verification_token;

                    if (user.role_status === ERoleStatus.BASIC_USER) {
                        this.sendGrid.sendMail({
                            email: user.email,
                            verification_token: user.verification_token
                        });
                    }

                    return {
                        user,
                        token,
                        refresh_token: token
                    };
                }
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, {
                    email: payload.email
                });
            } else {
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
                    email: payload.email
                });
            }
        } catch (error) {
            throw new ErrorObject(ErrorCodes.CAN_NOT_LOGIN, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, error);
        }
    }

    async loginPhone(payload: ILoginPhone) {
        try {
            const user = await this.userRepo.findUserByData(payload.phone_number, 'phone_number');
            if (user !== null) {
                const match = await this.compareHasPassword(payload.password, user.password);
                if (match) {
                    const token = this.generateJWTTokenUser(user);
                    delete user.password;

                    if (user.role_status === ERoleStatus.BASIC_USER) {
                        this.sendGrid.sendMail({
                            email: user.email,
                            verification_token: user.verification_token
                        });
                    }

                    return {
                        user,
                        token,
                        refresh_token: token
                    };
                }
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, {
                    phone_number: payload.phone_number
                });
            } else {
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
                    phone_number: payload.phone_number
                });
            }
        } catch (error) {
            throw new ErrorObject(ErrorCodes.CAN_NOT_LOGIN, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, error);
        }
    }

    private async hashPassword(plainPass: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.hashSalt);

        // eslint-disable-next-line @typescript-eslint/return-await
        return await bcrypt.hash(plainPass, salt);
    }

    public async compareHasPassword(plainPass: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(plainPass, hash);
    }

    private generateJWTTokenUser(userData: Users) {
        return jwt.sign(
            {
                data: {
                    id: userData.id,
                    email: userData.email,
                    role: userData.role_status
                }
            },
            this.jwtSecret,
            { expiresIn: '24h' }
        );
    }

    private verifyJWTToken(token: string) {
        try {
            // data from generateJWTTokenUser()
            const data = jwt.verify(token, this.jwtSecret);
            return data;
        } catch (error) {
            throw new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, ErrorMessages.USER_NOT_LOGIN, error);
        }
    }

    async updatePassword(payload: IUpdatePassword) {
        try {
            const user = await this.userRepo.findUserByData(payload.email, 'email');
            if (user !== null || user !== undefined) {
                const match = await this.compareHasPassword(payload.old_password, user.password);
                if (match) {
                    const hashedPassword = await this.hashPassword(payload.new_password);
                    await this.userRepo.updatePassword(payload.id, hashedPassword);
                    delete user.password;
                    delete user.pin;
                    delete user.verification_token;

                    const token = this.generateJWTTokenUser(user);
                    return {
                        user,
                        token,
                        refresh_token: token
                    };
                }
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, {
                    email: payload.email
                });
            } else {
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
                    email: payload.email
                });
            }
        } catch (error) {
            throw new ErrorObject(ErrorCodes.CAN_NOT_LOGIN, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, error);
        }
    }

    async addPinForUser(payload: any) {
        try {
            const user = await this.userRepo.findUserByData(payload.email, 'email');
            if (user !== null || user !== undefined) {
                const hashedPassword = await this.hashPassword(payload.new_pin);
                await this.userRepo.updatePin(payload.id, hashedPassword);
                delete user.password;
                delete user.pin;
                delete user.verification_token;

                const token = this.generateJWTTokenUser(user);
                return {
                    user,
                    token,
                    refresh_token: token
                };
            }
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
                email: payload.email
            });
        } catch (error) {
            throw new ErrorObject(ErrorCodes.CAN_NOT_LOGIN, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, error);
        }
    }

    async updatePinForUser(payload: IUpdatePin) {
        try {
            const user = await this.userRepo.findUserByData(payload.email, 'email');
            if (user !== null || user !== undefined) {
                const match = await this.compareHasPassword(payload.old_pin, user.pin);
                if (match) {
                    const hashedPassword = await this.hashPassword(payload.new_pin);
                    await this.userRepo.updatePin(payload.id, hashedPassword);
                    delete user.password;
                    delete user.pin;
                    delete user.verification_token;

                    const token = this.generateJWTTokenUser(user);
                    return {
                        user,
                        token,
                        refresh_token: token
                    };
                }
                throw new ErrorObject('400', 'PIN tidak sesuai.', {
                    pin: payload.old_pin
                });
            } else {
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
                    email: payload.email
                });
            }
        } catch (error) {
            throw new ErrorObject(ErrorCodes.CAN_NOT_LOGIN, ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, error);
        }
    }

    async getUserInfo(payload: IPayloadAuthData, id?: string): Promise<any> {
        let user: Users;
        if (payload.email) {
            user = await this.userRepo.findUserByData(payload.email, 'email');
        } else if (payload.id) {
            user = await this.userRepo.findUserByData(payload.id, 'id');
        }

        if (id !== 'ADMIN' && id !== user.id) {
            throw new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'User Tidak Ditemukan.');
        }

        delete user.verification_token;
        delete user.password;
        delete user.pin;

        if (user) {
            return user;
        }
        throw new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, ErrorMessages.USER_NOT_FOUND, payload);
    }

    async getUserById(id?: string): Promise<Users> {
        const user = await this.userRepo.findOne(id);

        if (user) {
            return user;
        }

        throw new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, ErrorMessages.USER_NOT_FOUND, user);
    }

    async getClient(id: string): Promise<OutletTypes> {
        const data = await this.outletTypeService.findOne(id);

        return data;
    }

    async updateUserInfo(payload: any) {
        try {
            const user = await this.userRepo.findOne(payload.id);

            if (user === null || user === undefined) {
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
                    id: payload.id
                });
            }

            const phoneExist = await this.userRepo.findUserByData(`+62${payload.phone_number}`, 'phone_number');

            if (phoneExist) {
                if (phoneExist.id !== user.id) {
                    throw new ErrorObject('400', 'Phone number already exists', {
                        email: payload.email,
                        phone_number: payload.phone_number
                    });
                }
            }

            const emailExist = await this.userRepo.findUserByData(payload.email, 'email');

            if (emailExist) {
                if (emailExist.id !== user.id) {
                    throw new ErrorObject('400', 'Email already exists', {
                        email: payload.email,
                        phone_number: payload.phone_number
                    });
                }
            }

            if (payload.outlet_types_id !== user.outlet_types_id) {
                const client = await this.outletTypeService.findOne(payload.outlet_types_id);

                if (!client) {
                    throw new ErrorObject('404', 'Client not found.');
                }

                const userOrder = await this.orderRepo.findOrderByUserId(user.id);
                const allCompleted = userOrder.every((val) => val.status === OrderStatuses.COMPLETED);

                if (!allCompleted) {
                    throw new ErrorObject('400', 'the User not yet completed their order.');
                }

                if (user.loan_limit === user.loan_level) {
                    payload.loan_limit = client.loan_limit;
                }

                payload.loan_level = client.loan_limit;
            }

            if (payload.phone_number && !payload.password) {
                payload.phone_number = `+62${payload.phone_number}`;
                payload.password = await this.hashPassword(`${payload.phone_number}`.replace(/^(\+62)+/g, '0'));
            }
            console.log(`${payload.phone_number}`.replace(/^(\+62)+/g, '0'));

            const updatedUser = await this.userRepo.save(
                {
                    ...user,
                    ...payload
                },
                { reload: true }
            );

            // delete updatedUser.password;
            delete updatedUser.verification_token;

            return updatedUser;
        } catch (error) {
            throw new ErrorObject('400', ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, error);
        }
    }

    async updateUserRole(payload: any) {
        try {
            const user = await this.userRepo.findOne(payload.id);
            const client = await this.outletTypeService.findOne(user.outlet_types_id);

            if (user === null || user === undefined) {
                throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
                    id: payload.id
                });
            }

            if (client.active === false) {
                throw new ErrorObject('400', 'Cannot verify user because the client is inactive', {
                    client_id: client.id,
                    client_name: client.name,
                    client_status: client.active
                });
            }

            if (payload.role_status === ERoleStatus.UNVERIFIED_USER) {
                user.verification_token = String(Math.floor(Math.random() * (999999 - 100000) + 100000));
            }

            const updatedUser = await this.userRepo.save(
                {
                    ...user,
                    ...payload
                },
                { reload: true }
            );

            delete updatedUser.password;
            delete updatedUser.pin;
            delete updatedUser.verification_token;

            return updatedUser;
        } catch (error) {
            throw new ErrorObject('400', ErrorMessages.USER_NOT_FOUND_OR_WRONG_PASS, error);
        }
    }

    async updateUserProfilePicture(authData: IPayloadAuthData, payload: Express.Multer.File) {
        const user = await this.userRepo.findUserByData(authData.email, 'email');
        if (user !== null && user !== undefined) {
            const updatedUser = await this.userRepo.save(
                {
                    ...user,
                    photo_url: `/user_photo/${payload.filename}`
                },
                { reload: true }
            );

            console.info(
                {
                    user_before: user,
                    user_updated: updatedUser
                },
                'UPDATED USER'
            );

            delete updatedUser.password;
            delete updatedUser.pin;
            delete updatedUser.verification_token;
            return updatedUser;
        }
        throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, ErrorMessages.USER_NOT_FOUND, {
            email: authData.email
        });
    }

    private mappedUserRole(customerDetail: IDnrCustomerData) {
        /**
         * EXAMPLE OF CUSTOMER DETAIL
         * "izin_cust": "",
            "tgl_izin": "0000-00-00",
            "izin_apj": "",
            "tgl_izin_apj": "0000-00-00",
            "tgl_data": "2021-09-24 14:20:31"
            ======================================
            "izin_cust": "/izin/cust/0215255243",
            "tgl_izin": "2021-09-23",
            "izin_apj": "Izin/apj/Dummies/2198",
            "tgl_izin_apj": "2021-09-28",

         */
        if (customerDetail.izin_apj && customerDetail.izin_apj.length > 1) {
            const expiredDateApj = new Date(customerDetail.tgl_izin_apj);
            const isExpired = expiredDateApj.getTime() - new Date().getTime();
            if (isExpired > 0) {
                return ERoleStatus.AJP_USER;
            }
        }
        return ERoleStatus.AUTHORIZED_USER;
    }

    async verifiedEmailToken(email: string, token: string) {
        const user = await this.userRepo.findUserByData(email, 'email');

        if (user.verification_token !== token) {
            throw new ErrorObject(ErrorCodes.VERIFICATION_EMAIL_ERROR, ErrorMessages.INVALID_TOKEN_VERIFICATION);
        }

        await this.userRepo.update({ email: user.email }, { role_status: ERoleStatus.AUTHORIZED_USER });

        return 'OK';
    }

    private async updateCustomerId(user: Users, customer: IDnrCustomerData) {
        try {
            const updateUser = await this.userRepo.save(
                {
                    ...user,
                    customer_id: customer.kdcust,
                    loan_level: customer.top,
                    role_status: this.mappedUserRole(customer)
                },
                { reload: true }
            );
            return updateUser;
        } catch (error) {
            if (error.message && error.message.includes('duplicate')) {
                throw new ErrorObject(ErrorCodes.CAN_NOT_REGISTER, ErrorMessages.DUPLICATE_CUSTOMER_ID, {
                    error,
                    customer,
                    user
                });
            }
            throw error;
        }
    }

    public async resendEmailVerification(email: string) {
        const user = await this.userRepo.findUserByData(email, 'email');
        if (user !== undefined && user !== null) {
            const newVerificationToken = String(Math.floor(Math.random() * (999999 - 100000) + 100000));
            await this.userRepo.save(
                {
                    ...user,
                    verification_token: newVerificationToken
                },
                { reload: true }
            );

            this.sendGrid.sendMail({
                email,
                verification_token: newVerificationToken
            });
        }
    }

    public async checkUserVerification(userId: string): Promise<boolean> {
        const user = await this.userRepo.findOne(userId);

        if (user.role_status === ERoleStatus.UNVERIFIED_USER || user.role_status === ERoleStatus.BASIC_USER) {
            return false;
        }

        return true;
    }

    async checkUserOutlet(userId: string): Promise<boolean> {
        const user = await this.userRepo.findOne(userId);
        const outlet = await this.outletService.getOutletById(user.id);
        if (
            !outlet ||
            outlet.name === null ||
            outlet.name === '' ||
            outlet.type === null ||
            outlet.type === '' ||
            outlet.npwp === null ||
            outlet.npwp === ''
        ) {
            return false;
        }

        return true;
    }

    async checkUserOutletAddress(userId: string): Promise<boolean> {
        const user = await this.userRepo.findOne(userId);
        const result = await this.outletAddressService.getOneAddressByUserId(user.id);

        return result;
    }

    public async getAllUser(query: IQueryUsers) {
        const users = await this.userRepo.findAllUser(query);

        return users;
    }

    public async getAllUserNoFilter(query: IQueryUsers) {
        const users = await this.userRepo.findAllUserPagination(query);

        return users;
    }

    public async updateUserCustomerId(noref_dplus: string, customerId: string) {
        const user = await this.userRepo.findOne({ noref_dplus });

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'Data no ref Dplus tidak ditemukan');
        }

        const updatedUser = await this.userRepo.save(
            {
                ...user,
                customer_id: customerId
            },
            { reload: true }
        );

        this.sendGrid.sendCustomerIdUpdatedEmail({
            email: updatedUser.email,
            customer_id: customerId
        });

        return updatedUser as Users;
    }

    public async countAll(query?: IQueryUsers, payload?: any) {
        const total = await this.userRepo.countAll(query);
        return total;
    }

    async sendChat(id: string, text: string) {
        const user = await this.userRepo.findOne({ id });

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'User Tidak Ditemukan', {
                user,
                id,
                text
            });
        }

        await this.fireBase.sendChat(user.id, text, user.role_status);
    }

    async updateReadChat(userId: string, userLoginId: string) {
        const user = await this.userRepo.find({ id: userId });

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'User Tidak Ditemukan', {
                userr_id: userId,
                user_login_id: userLoginId
            });
        }
        await this.fireBase.readChat(userId, userLoginId);
    }

    async sendChatForAdmin(admin: { id: string; email: string }, userId: string, text: string) {
        const user = await this.userRepo.find({ id: userId });

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'User Tidak Ditemukan', {
                admin_id: admin.id,
                admin_email: admin.email,
                user_id: userId,
                text
            });
        }

        await this.fireBase.sendChatForAdmin(userId, admin.id, text);
    }

    async requestPasswordReset(email: string): Promise<boolean> {
        const user = await this.userRepo.findUserByData(email, 'email');

        if (!user) {
            return false;
        }

        const token = randomBytes(32).toString('hex');
        const expireAt = addDays(new Date(), 1);

        user.reset_password_token = token;
        user.reset_password_expired_at = expireAt;

        await this.userRepo.save(user);

        this.sendGrid.sendPasswordResetEmail({
            email: user.email,
            verification_token: `${user.id}.${token}`,
            expiry_at: formatToTimeZone(expireAt, 'D MMMM YYYY pukul HH:mm:ss', { timeZone: 'Asia/Jakarta' })
        });

        return true;
    }

    async requestPinReset(email: string): Promise<boolean> {
        const user = await this.userRepo.findUserByData(email, 'email');

        if (!user) {
            return false;
        }

        const token = randomBytes(32).toString('hex');
        const expireAt = addDays(new Date(), 1);

        user.reset_pin_token = token;
        user.reset_pin_expired_at = expireAt;

        await this.userRepo.save(user);

        this.sendGrid.sendPinResetEmail({
            email: user.email,
            verification_token: `${user.id}.${token}`,
            expiry_at: formatToTimeZone(expireAt, 'D MMMM YYYY pukul HH:mm:ss', { timeZone: 'Asia/Jakarta' })
        });

        return true;
    }

    async resetPassword(resetPasswordData: IResetPasswordData): Promise<Users> {
        const userId = resetPasswordData.token.split('.')[0];
        const token = resetPasswordData.token.split('.')[1];
        const user = await this.userRepo.findByResetPasswordToken(userId, token);

        if (!user) {
            throw new ErrorObject(ErrorCodes.RESET_PASSWORD_ERROR, 'Reset password token tidak valid');
        }

        if (resetPasswordData.new_password !== resetPasswordData.confirmation_password) {
            throw new ErrorObject(
                ErrorCodes.RESET_PASSWORD_ERROR,
                'Password baru dan confirmation password tidak sesuai'
            );
        }

        user.password = await this.hashPassword(resetPasswordData.new_password);
        user.reset_password_token = null;
        user.reset_password_expired_at = null;

        return this.userRepo.save(user);
    }

    async resetPin(resetPasswordData: IResetPinData): Promise<Users> {
        const tokens = resetPasswordData.token.split('.');
        const userId = tokens[0];
        const token = tokens[1];
        const user = await this.userRepo.findByResetPinToken(userId, token);

        if (!user) {
            throw new ErrorObject('RESET_PIN_ERROR', 'Reset password token tidak valid');
        }

        if (resetPasswordData.new_pin !== resetPasswordData.confirmation_pin) {
            throw new ErrorObject('RESET_PIN_ERROR', 'PIN baru dan confirmation PIN tidak sesuai');
        }

        user.pin = await this.hashPassword(resetPasswordData.new_pin);
        user.reset_pin_token = null;
        user.reset_pin_expired_at = null;

        return this.userRepo.save(user);
    }

    async importExcelUser(payload: Express.Multer.File): Promise<any> {
        try {
            const filePath = `${process.cwd()}/public/tmp/${payload.filename}`;

            const importFile = xlsx.readFile(filePath);

            let data: any[];
            await Promise.all(
                importFile.SheetNames.map((v, k) => {
                    const temp = xlsx.utils.sheet_to_json(importFile.Sheets[importFile.SheetNames[k]]);
                    data = temp.map((el: any) => {
                        return Object.fromEntries(
                            Object.entries(el).map(([key, value]) => [key.replace(/\s+/g, ''), value])
                        );
                    });
                })
            );

            const errData: string[] = [];
            await Promise.all(
                data.map(async (v: any, k: number) => {
                    const client = await this.outletTypeService.getByName(v.ClientName);

                    if (!client) {
                        return errData.push(`Client not found on import data ${v.ClientName}.`);
                    }

                    const userEmail = await this.userRepo.findUserByData(v.Email, 'email');

                    if (userEmail) {
                        return errData.push(`User already exists on ${v.Email}.`);
                    }

                    const userPhone = await this.userRepo.findUserByData(`+62${v.Phone}`, 'phone_number');

                    if (userPhone) {
                        return errData.push(`User already exists on ${v.Phone}.`);
                    }

                    const userKtp = await this.userRepo.findUserByData(v.Ktp, 'ktp');

                    if (userKtp) {
                        return errData.push(`User already exists on ${v.Ktp}`);
                    }

                    const hashedPw = await this.hashPassword(`0${v.Phone}`);

                    if (errData.length === 0) {
                        await this.userRepo.saveImportData({
                            name: v.Name,
                            email: v.Email,
                            password: hashedPw,
                            ktp: v.Ktp,
                            gender: v.Gender,
                            phone_number: v.Phone !== '' ? `+62${v.Phone}` : '-',
                            role_status: ERoleStatus.UNVERIFIED_USER,
                            login_provider: ELoginProvider.MANUAL,
                            photo_url: null,
                            verification_token: String(Math.floor(Math.random() * (999999 - 100000) + 100000)),
                            noref_dplus: `cust${new Date().getTime().toString().slice(4, 10)}`,
                            outlet_types_id: client.id,
                            loan_limit: client.loan_limit,
                            loan_level: client.loan_limit
                        });
                    }
                })
            );

            fs.unlink(filePath, (err) => {
                if (err) console.log(err);
            });

            if (errData.length > 0) {
                return false;
            }

            return true;
        } catch (error) {
            throw new ErrorObject(
                'IMPORT ERROR',
                'Gagal mengimpor data Excel. Mohon periksa kembali data impor.',
                error
            );
        }
    }

    async setUsersLoanLimit(client_id: string, loan_limit: number): Promise<any> {
        try {
            const users = await this.userRepo.findUsersByClient(client_id);

            const user_id = users.map((v, k) => {
                return v.id;
            });

            const matched_user_id: string[] = [];

            if (loan_limit === 0) {
                await Promise.all(
                    user_id.map(async (v, k) => {
                        await this.userRepo.changeLoanLevel(v, loan_limit);
                    })
                );
            } else {
                await Promise.all(
                    user_id.map(async (v, k) => {
                        const orders = await this.orderRepo.findOrderByUserId(v);

                        const isMatching = orders.every(
                            (val, i, arr) => val.status === OrderStatuses.COMPLETED || val === null || val === undefined
                        );

                        if (isMatching) {
                            matched_user_id.push(v);
                        }
                    })
                );

                await Promise.all(
                    matched_user_id.map(async (v, k) => {
                        await this.userRepo.changeLoanLevel(v, loan_limit);
                    })
                );
            }
        } catch (error) {
            throw new ErrorObject('UPDATE ERROR', 'Gagal mengubah loan limit.', error);
        }
    }
}
