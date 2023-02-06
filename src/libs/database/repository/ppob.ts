/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ppob } from 'src/models/ppobs';
import { EntityRepository, Repository } from 'typeorm';

export interface IPpobRepo {
    find(options?: any): Promise<Ppob[]>;
    findWithExclusion(options?: any): Promise<Ppob[]>;
    findOne(id?: string): Promise<Ppob>;
    findOneWithOption(options: any): Promise<Ppob>;
    findCategory(): Promise<Ppob[]>;
    insertData(payload: any): Promise<any>;
    upsertData(payload: any): Promise<any>;
    updateData(payload: any, id: string): Promise<any>;
    delete(id: string): Promise<any>;
    deleteSync(payload: string[]): Promise<any>;
}

@EntityRepository(Ppob)
export class PpobRepository extends Repository<Ppob> {
    findOneWithOption(options: any): Promise<Ppob> {
        return this.findOne({
            where: options
        });
    }

    findWithExclusion(): Promise<Ppob[]> {
        return this.find({
            select: [
                'product_name',
                'category',
                'brand',
                'type',
                'seller_name',
                'price',
                'buyer_sku_code',
                'buyer_product_status',
                'seller_product_status',
                'unlimited_stock',
                'stock',
                'multi',
                'start_cut_off',
                'end_cut_off',
                'desc'
            ]
        });
    }

    findCategory(): Promise<Ppob[]> {
        return this.createQueryBuilder('ppob').select('category').distinct(true).getRawMany();
    }

    insertData(payload: any): Promise<any> {
        return this.createQueryBuilder().insert().into(Ppob).values(payload).execute();
    }

    upsertData(payload: any): Promise<any> {
        return this.createQueryBuilder()
            .insert()
            .into(Ppob)
            .values(payload)
            .orUpdate(
                [
                    'price',
                    'buyer_product_status',
                    'seller_product_status',
                    'unlimited_stock',
                    'stock',
                    'start_cut_off',
                    'end_cut_off'
                ],
                ['buyer_sku_code'],
                {
                    skipUpdateIfNoValuesChanged: true
                }
            )
            .execute();
    }

    updateData(payload: any, id: string): Promise<any> {
        return this.createQueryBuilder().update(Ppob).set(payload).where('id = :id', { id }).execute();
    }

    deleteSync(payload: string[]): Promise<any> {
        return this.createQueryBuilder()
            .delete()
            .from(Ppob)
            .where('buyer_sku_code NOT IN (:payload)', { payload })
            .execute();
    }
}
