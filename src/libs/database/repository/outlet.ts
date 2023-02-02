/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Outlets } from 'src/models/Outlets';
import { EntityRepository, Repository } from 'typeorm';

export interface IUserRepo {
    findOutletDatas(): Promise<Outlets[]>;
    findOutletData(id: string): Promise<Outlets>;
    save(outlet: Outlets): Promise<Outlets>;
    findOutletDataByUserId(userId: string): Promise<Outlets>;
}

@EntityRepository(Outlets)
export class OutletRepository extends Repository<Outlets> {
    public async findOutletDatas(): Promise<Outlets[]> {
        return this.createQueryBuilder('outlets').getMany();
    }

    public async findOutletData(outletId: string): Promise<Outlets> {
        return this.createQueryBuilder('outlets').where('outlets.id = :outletId', { outletId }).getOne();
    }

    public async findOutletDataByUserId(userId: string): Promise<Outlets> {
        return this.createQueryBuilder('outlets').where('outlets.user_id = :userId', { userId }).getOne();
    }

    public async createOutlet(id: string, payload: any) {
        return this.createQueryBuilder('outlets').insert().into(Outlets).values(payload).execute();
    }
}
