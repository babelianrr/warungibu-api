/* eslint-disable @typescript-eslint/no-unused-vars */
import { News } from 'src/models/news';
import { OutletTypes } from 'src/models/Outlet-types';
import { EntityRepository, Repository, Brackets } from 'typeorm';

export interface IOutletTypeCreate {
    name: string;
    npwp: string;
    phone: string;
    address?: string;
    loan_limit: number;
}

@EntityRepository(OutletTypes)
export class OutletTypesRepository extends Repository<OutletTypes> {
    async getByName(name: string): Promise<OutletTypes> {
        return this.createQueryBuilder().where('name = :name', { name }).getOne();
    }
}
