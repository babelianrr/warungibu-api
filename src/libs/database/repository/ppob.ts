/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ppob } from 'src/models/ppobs';
import { EntityRepository, Repository } from 'typeorm';

export interface IPpobRepo {
    find(options?: any): Promise<Ppob[]>;
    findWithExclusion(options?: any): Promise<Ppob[]>;
    findOne(id?: string): Promise<Ppob>;
    findOneWithOption(options: any): Promise<Ppob>;
    findOneByOption(payload: any): Promise<Ppob>;
    findForUser(category?: any): Promise<Ppob[]>;
    findCategory(clause?: any): Promise<Ppob[]>;
    insertData(payload: any): Promise<any>;
    upsertData(payload: any): Promise<any>;
    updateData(payload: any, id: string): Promise<any>;
    delete(id: string): Promise<any>;
    deleteSync(buyer_sku_code: string[], seller_name: string[]): Promise<any>;
}

@EntityRepository(Ppob)
export class PpobRepository extends Repository<Ppob> {
    findOneWithOption(options: any): Promise<Ppob> {
        return this.findOne({
            where: options
        });
    }

    findOneByOption(payload: any): Promise<Ppob> {
        return this.createQueryBuilder('ppob')
            .where('ppob.buyer_sku_code = :buyer_sku_code', { buyer_sku_code: payload.buyer_sku_code })
            .andWhere('ppob.product_name = :product_name', { product_name: payload.product_name })
            .andWhere('ppob.seller_name = :seller_name', { seller_name: payload.seller_name })
            .getOne();
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

    findCategory(clause?: any): Promise<Ppob[]> {
        const qb = this.createQueryBuilder('ppob').select('category').distinct(true);

        if (clause) {
            qb.where(`ppob.category ILIKE :clause`, { clause });
        }

        return qb.getRawMany();
    }

    findForUser(category?: string): Promise<Ppob[]> {
        const qb = this.createQueryBuilder('ppob').where('ppob.active = TRUE');

        if (category) {
            qb.andWhere(`ppob.category = :category`, { category });
        }

        return qb.getRawMany();
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
                    'category',
                    'brand',
                    'type',
                    'seller_name',
                    'buyer_product_status',
                    'seller_product_status',
                    'unlimited_stock',
                    'stock',
                    'start_cut_off',
                    'end_cut_off',
                    'desc'
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

    deleteSync(buyer_sku_code: string[], seller_name: string[]): Promise<any> {
        return this.createQueryBuilder()
            .delete()
            .from(Ppob)
            .where('buyer_sku_code NOT IN (:buyer_sku_code)', { buyer_sku_code })
            .orWhere('seller_name NOT IN (:seller_name)', { seller_name })
            .execute();
    }
}
