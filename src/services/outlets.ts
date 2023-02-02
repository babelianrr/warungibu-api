/* eslint-disable no-else-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { OutletRepository } from 'src/libs/database/repository/outlet';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorMessages } from 'src/libs/error_message';
import { ErrorCodes } from 'src/libs/errors';

export interface IOutletService {
    getOutlet(): Promise<any>;
    getOutletById(outletId: string): Promise<any>;
    createOutlet(userId: string, payload: any): Promise<any>;
    updateOutlet(userId: string, payload: any): Promise<any>;
}

export interface IUpdateDocsData {
    name?: string;
    file_no?: string;
    expired_date?: string;
    file?: Express.Multer.File;
}

export class OutletService implements IOutletService {
    private outletRepo: OutletRepository;

    constructor(outletRepo: OutletRepository) {
        this.outletRepo = outletRepo;
    }

    public async getOutlet() {
        try {
            let outlet = await this.outletRepo.findOutletDatas();
            if (outlet) {
                return outlet;
            } else {
                // return false;
                throw new ErrorObject(ErrorCodes.OUTLET_NOT_FOUND_ERROR, ErrorMessages.OUTLET_NOT_FOUND_ERROR);
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async getOutletById(userId: string) {
        try {
            let outlet = await this.outletRepo.findOutletDataByUserId(userId);
            if (outlet) {
                return outlet;
            } else {
                // return false;
                throw new ErrorObject(ErrorCodes.OUTLET_NOT_FOUND_ERROR, ErrorMessages.OUTLET_NOT_FOUND_ERROR);
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async createOutlet(userId: string, payload: any) {
        try {
            let outletExists = await this.outletRepo.findOutletDataByUserId(userId);
            if (outletExists) {
                throw new ErrorObject(ErrorCodes.OUTLET_CREATION_ERROR, 'User already have an outlet.', outletExists);
            }
            const outlet = await this.outletRepo.save(
                {
                    ...payload,
                    user_id: userId
                },
                { reload: true }
            );

            const newOutletData = await this.outletRepo.findOutletDataByUserId(userId);
            return newOutletData;
        } catch (error) {
            if (error.message && error.message.includes('npwp')) {
                throw new ErrorObject(ErrorCodes.OUTLET_CREATION_ERROR, 'NPWP already registered', error);
            }
            throw error;
        }
    }

    async createOrUpdate(userId: string, payload: any) {
        try {
            let ouletExsist = await this.outletRepo.findOutletDataByUserId(userId);

            if (ouletExsist) {
                const outlet = await this.outletRepo.save(
                    {
                        ...ouletExsist,
                        ...payload
                    },
                    { reload: true }
                );
            } else {
                const outlet = await this.outletRepo.save(
                    {
                        ...payload,
                        user_id: userId
                    },
                    { reload: true }
                );
            }

            const newOutletData = await this.outletRepo.findOutletDataByUserId(userId);
            return newOutletData;
        } catch (error) {
            if (error.message && error.message.includes('npwp')) {
                throw new ErrorObject(ErrorCodes.OUTLET_CREATION_ERROR, 'NPWP already registered', error);
            }
            throw error;
        }
    }

    public async updateOutlet(userId: string, payload: any) {
        let ouletExist = await this.outletRepo.findOutletDataByUserId(userId);
        if (!ouletExist) {
            throw new ErrorObject(ErrorCodes.OUTLET_CREATION_ERROR, 'Outlet does not exsist', ouletExist);
        }
        const outlet = await this.outletRepo.save(
            {
                ...ouletExist,
                ...payload
            },
            { reload: true }
        );

        return {
            ...ouletExist,
            ...outlet
        };
    }
}
