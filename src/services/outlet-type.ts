/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import { DeleteResult } from 'typeorm';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { IOutletTypeCreate, OutletTypesRepository } from 'src/libs/database/repository/outlet_types';
import { OutletTypes } from 'src/models/Outlet-types';
import { UserRepository } from 'src/libs/database/repository/user';
import { ERoleStatus } from 'src/models/Users';
import { OrderRepository } from 'src/libs/database/repository/order';

export interface IOutletTypeService {
    create(news: IOutletTypeCreate): Promise<OutletTypes>;
    update(updateData: any): Promise<OutletTypes>;
    get(): Promise<OutletTypes[]>;
    getById(id: string): Promise<OutletTypes>;
    getByName(name: string): Promise<OutletTypes>;
    delete(id: string): Promise<DeleteResult>;
}

export class OutletTypeService implements IOutletTypeService {
    private repository: OutletTypesRepository;

    private userRepo: UserRepository;

    private orderRepo: OrderRepository;

    constructor(repository: OutletTypesRepository, userRepo: UserRepository, orderRepo: OrderRepository) {
        this.repository = repository;
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
    }

    get(): Promise<OutletTypes[]> {
        return this.repository.find({
            order: {
                created_at: 'DESC'
            }
        });
    }

    async getById(id: string): Promise<OutletTypes> {
        const outletType = await this.repository.findOne({ where: { id } });

        if (!outletType) {
            throw new ErrorObject(ErrorCodes.OUTLET_TYPES_ERROR, 'Outlet Type Not Found', null);
        }

        return outletType;
    }

    async getByName(name: string): Promise<OutletTypes> {
        const outletType = await this.repository.findOne({ where: { name } });

        if (!outletType) {
            throw new ErrorObject(ErrorCodes.OUTLET_TYPES_ERROR, 'Outlet Type Not Found', null);
        }

        return outletType;
    }

    create(payload: IOutletTypeCreate): Promise<OutletTypes> {
        return this.repository.save(payload);
    }

    async update(updateData: any): Promise<OutletTypes> {
        const outletType = await this.repository.findOne(updateData.id);

        if (!outletType) {
            throw new ErrorObject(ErrorCodes.OUTLET_TYPES_ERROR, 'Outlet Type Not Found', null);
        }

        const users = await this.userRepo.findUsersByClient(outletType.id);

        if (users) {
            await Promise.all(
                users.map(async (v) => {
                    await this.userRepo.save(
                        {
                            ...v,
                            role_status: ERoleStatus.UNVERIFIED_USER,
                            verification_token: String(Math.floor(Math.random() * (999999 - 100000) + 100000))
                        },
                        {
                            reload: true
                        }
                    );
                })
            );
        }

        const newOutletType = {
            ...outletType,
            ...updateData
        };

        return this.repository.save(newOutletType);
    }

    async delete(id: string): Promise<DeleteResult> {
        const outletTypes = await this.repository.findOne({ id });

        if (!outletTypes) {
            throw new ErrorObject(ErrorCodes.OUTLET_TYPES_ERROR, 'Outlet Type Not Found', null);
        }

        return this.repository.delete({ id });
    }
}
