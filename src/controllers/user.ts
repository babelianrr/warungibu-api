/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Router, Request, Response, NextFunction } from 'express';
import { EGender, ERoleStatus } from 'src/models/Users';
import { IUserService } from 'src/services/user';
import { IOrderService, OrderService } from 'src/services/order';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { INotificationService } from 'src/services/notification';
import { NotificationMessage } from 'src/models/Notifications';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import { setPrefixPath, uploadHandler } from './middlewares/handle-upload';
import { adminAuthentication, authentication, IRequestExtra } from './middlewares/authentication';
import { uploadHandlerExcel } from './middlewares/handle-upload-excel';

export class UserController {
    private readonly userService: IUserService;

    private readonly orderService: IOrderService;

    private readonly notificationService: INotificationService;

    private isAdminRequest = false;

    private router: Router;

    public constructor(
        userService: IUserService,
        orderService: OrderService,
        type: string,
        notificationService: INotificationService
    ) {
        this.userService = userService;
        this.orderService = orderService;
        this.notificationService = notificationService;
        this.router = Router();
        this.router.get('/download_apk', this.downloadApk.bind(this));
        this.router.get('/download_form', this.downloadForm.bind(this));
        this.router.post('/register', this.register.bind(this));
        this.router.post('/login', this.loginPhone.bind(this));
        this.router.post('/login_email', this.loginEmail.bind(this));
        this.router.post('/resend_email_verification', this.resendEmailVerification.bind(this));
        this.router.post('/forgot-password', this.requestResetPassword.bind(this));
        this.router.post('/forgot-password/:token', this.resetPassword.bind(this));

        if (type === 'ADMIN') {
            this.isAdminRequest = true;
            this.router.post('/login_admin', this.loginEmail.bind(this));
            this.router.get('/:id/get-receipt', this.getReceiptForAdmin.bind(this));
            this.router.post('/import-excel', uploadHandlerExcel.single('file'), this.importExcelUser.bind(this));
            this.router.get('/export-excel', this.exportExcelUser.bind(this));
            this.router.use(adminAuthentication);
            this.router.get('/', this.getAllUserForAdmin.bind(this));
            this.router.post('/register_admin', this.registerAdmin.bind(this));
            this.router.post('/chats', this.sendChatForAdmin.bind(this));
            this.router.post('/chats/read', this.readChatAdmin.bind(this));
            this.router.post('/register_admin', this.registerAdmin.bind(this));
            this.router.post('/customer_id', this.updateUserCustomerId.bind(this));
            this.router.get('/:data', this.getUserByIdForAdmin.bind(this));
            this.router.patch('/:id', this.updateUserInfo.bind(this));
            this.router.patch('/:id/verify', this.updateUserRole.bind(this));
            this.router.get('/:id', this.getUserDetail.bind(this));
        } else {
            this.router.use(authentication);
            this.router.patch('/password/id', this.updatePassword.bind(this));
            this.router.patch('/add-pin', this.addPinForUser.bind(this));
            this.router.patch('/update-pin', this.updatePinForUser.bind(this));
            this.router.post('/get_customer_detail', this.updateCustomerDetail.bind(this));
            this.router.post('/verified_email_token', this.verifiedEmailToken.bind(this));
            this.router.get('/verification_check', this.userVerificationCheck.bind(this));
            this.router.post('/chats', this.sendChat.bind(this));
            this.router.post('/chats/read', this.readChatUser.bind(this));
            this.router.post('/import-excel', uploadHandlerExcel.single('file'), this.importExcelUser.bind(this));
            this.router.get('/export-excel', this.exportExcelUser.bind(this));
            this.router.patch(
                '/profile_picture/upload',
                setPrefixPath('user_photo'),
                uploadHandler.single('file'),
                this.updateProfilePicture.bind(this)
            );
            this.router.post('/register_sap', this.registerSap.bind(this));
            this.router.get('/:id', this.getUserDetail.bind(this));
        }
    }

    getRouter(): Router {
        return this.router;
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.register({
                name: req.body.name,
                email: req.body.email,
                gender: req.body.gender,
                ktp: req.body.ktp,
                phone_number: req.body.phone_number,
                outlet_types_id: req.body.outlet_types_id,
                role_status: ERoleStatus.UNVERIFIED_USER
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async loginEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.loginEmail({
                email: req.body.email,
                password: req.body.password
            });

            if (
                this.isAdminRequest &&
                ![ERoleStatus.ADMIN, ERoleStatus.SUPER_ADMIN].includes(result.user.role_status)
            ) {
                throw new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login as admin', null);
            }

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async loginPhone(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.loginPhone({
                phone_number: req.body.phone_number,
                password: req.body.password
            });

            if (
                this.isAdminRequest &&
                ![ERoleStatus.ADMIN, ERoleStatus.SUPER_ADMIN].includes(result.user.role_status)
            ) {
                throw new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login as admin', null);
            }

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async updatePassword(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id, email } = req.user;
            const result = await this.userService.updatePassword({
                id,
                email,
                new_password: req.body.new_password,
                old_password: req.body.old_password
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async addPinForUser(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id, email } = req.user;
            const result = await this.userService.addPinForUser({
                id,
                email,
                new_pin: req.body.new_pin
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async updatePinForUser(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id, email } = req.user;
            const result = await this.userService.updatePinForUser({
                id,
                email,
                new_pin: req.body.new_pin,
                old_pin: req.body.old_pin
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async getUserDetail(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id, email } = req.user;
            const result = await this.userService.getUserInfo(
                {
                    id,
                    email
                },
                id
            );

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async getUserById(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await this.userService.getUserById(id);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async updateProfilePicture(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id, email } = req.user;
            const result = await this.userService.updateUserProfilePicture({ id, email }, req.file);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async updateUserInfo(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.updateUserInfo({
                id: req.params.id,
                name: req.body.name,
                email: req.body.email,
                ktp: req.body.ktp,
                outlet_types_id: req.body.outlet_types_id,
                phone_number: req.body.phone_number,
                gender: req.body.gender,
                active: req.body.active
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async updateUserRole(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.updateUserRole({
                id: req.params.id,
                role_status: req.body.role_status
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async updateCustomerDetail(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id, email } = req.user;
            const result = await this.userService.updateByCustomerId(email, req.body.customer_id);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async verifiedEmailToken(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { email } = req.user;
            const result = await this.userService.verifiedEmailToken(email, req.body.token);
            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            return next(error);
        }
    }

    async resendEmailVerification(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            await this.userService.resendEmailVerification(email);
            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            return next(error);
        }
    }

    async userVerificationCheck(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const verification = await this.userService.checkUserVerification(req.user.id);
            return res.status(200).json({ role_status: verification });
        } catch (err) {
            return next(err);
        }
    }

    async sendChat(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, body } = req;

            await this.userService.sendChat(user.id, body.text);
            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            return next(error);
        }
    }

    async sendChatForAdmin(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, body } = req;

            await this.userService.sendChatForAdmin(
                {
                    id: user.id,
                    email: user.email
                },
                body.user_id,
                body.text
            );

            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            return next(error);
        }
    }

    async readChatAdmin(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, body } = req;

            // console.log(
            //     {
            //         user,
            //         body
            //     },
            //     'Read Chat By ADMIN'
            // );

            await this.userService.updateReadChat(body.user_id, user.id);

            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            return next(error);
        }
    }

    async readChatUser(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user } = req;

            // console.log(
            //     {
            //         user
            //     },
            //     'Read Chat By Customer'
            // );

            await this.userService.updateReadChat(user.id, user.id);

            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            return next(error);
        }
    }

    async registerAdmin(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.register({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone_number: req.body.phone_number || null,
                role_status: ERoleStatus.ADMIN,
                outlet_types_id: null
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async getAllUserForAdmin(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, query } = req;
            const users = await this.userService.getAllUser(query);
            const { totalUsers } = await this.userService.countAll(query);

            const totalPage = Math.ceil(Number(totalUsers) / Number(query.limit));
            const result = { page: Number(query.page), totalPage, users };

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async getUserByIdForAdmin(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { params } = req;
            const data = params.data?.includes('@') ? 'email' : 'id';
            const result = await this.userService.getUserInfo({ [data]: params.data }, 'ADMIN');

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async updateUserCustomerId(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { body, params } = req;
            // noref_dplus is user id in our database
            const result = await this.userService.updateUserCustomerId(body.noref_dplus, body.customer_id);

            await this.notificationService.createNotification(result.id, NotificationMessage.CUSTOMER_ID_UPDATED);

            return res.status(200).json(result);
        } catch (error) {
            if (error.message.includes('duplicate key')) {
                // console.log('Customer id sudah terpakai', req.body);
                next(
                    new ErrorObject(ErrorCodes.EXISTING_CUSTOMER_ID, 'Customer ID sudah terdaftar pada aplikasi', null)
                );
            }
            return next(error);
        }
    }

    async registerSap(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.registerSap(req.user);

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.userService.requestPasswordReset(req.body.email);

            return res
                .status(200)
                .json({ message: 'Link untuk reset password akan dikirimkan ke email yang disubmit' });
        } catch (error) {
            return next(error);
        }
    }

    async requestResetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.userService.requestPasswordReset(req.body.email);

            return res
                .status(200)
                .json({ message: 'Link untuk reset password akan dikirimkan ke email yang disubmit' });
        } catch (error) {
            return next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = {
                token: req.params.token,
                new_password: req.body.new_password,
                confirmation_password: req.body.confirmation_password
            };

            const result = await this.userService.resetPassword(data);

            return res.status(200).json({ message: 'Password telah diganti, silahkan login kembali' });
        } catch (error) {
            return next(error);
        }
    }

    async getReceiptForAdmin(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const order = await this.orderService.getOrderByUserId(req.params.id);

            return res.status(200).download(order.filename);
            // return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    async importExcelUser(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.userService.importExcelUser(req.file);

            if (result === true) {
                return res.status(200).json({ message: 'Successfully imported user data.' });
            }

            return res.status(400).json({ message: 'Failed importing user data.' });
        } catch (err) {
            return next(err);
        }
    }

    private fixWidth(worksheet: xlsx.WorkSheet) {
        const data = xlsx.utils.sheet_to_json<any>(worksheet);
        const colLengths = Object.keys(data[0]).map((k) => k.toString().length);
        for (const d of data) {
            Object.values(d).forEach((element: any, index) => {
                const { length } = element.toString();
                if (colLengths[index] < length) {
                    colLengths[index] = length;
                }
            });
        }
        worksheet['!cols'] = colLengths.map((l) => {
            return {
                wch: l
            };
        });
    }

    async exportExcelUser(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = await this.userService.getAllUserNoFilter(req.query);

            const users = data.map((v, k) => {
                return [
                    v.outlet_types_id.name ? v.outlet_types_id.name : '',
                    v.name,
                    v.email,
                    v.ktp,
                    v.gender,
                    v.phone_number
                ];
            });

            const filePath = `${process.cwd()}/public/tmp/${req.query.search}_UserList.xlsx`;

            const sheetColumnName = ['Client Name', 'Name', 'Email', 'Ktp', 'Gender', 'Phone'];

            const workBook = xlsx.utils.book_new();

            const workSheetData = [sheetColumnName, ...users];

            const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);

            this.fixWidth(workSheet);

            xlsx.utils.book_append_sheet(workBook, workSheet);

            xlsx.writeFile(workBook, path.resolve(filePath));

            res.download(filePath);

            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err) console.log(err);
                });
            }, 20000);
        } catch (err) {
            return next(err);
        }
    }

    async downloadForm(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const filePath = `${process.cwd()}/public/documents/FORMULIR_PENDAFTARAN_WARUNG_IBU.pdf`;

            res.download(filePath);
        } catch (error) {
            next(error);
        }
    }

    async downloadApk(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const filePath = `${process.cwd()}/public/app/id.co.warungibu.user_app.apk`;

            res.download(filePath);
        } catch (error) {
            next(error);
        }
    }
}
