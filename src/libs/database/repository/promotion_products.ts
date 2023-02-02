import { EntityRepository, getRepository, Repository } from 'typeorm';
import { PromotionsProducts } from 'src/models/promotion-product';
import { Promotions } from 'src/models/promotion';

@EntityRepository(PromotionsProducts)
export class PromotionProductsRepository extends Repository<PromotionsProducts> {
    deletePromotionProduct(id: string) {
        return this.delete(id);
    }

    checkPromotionProductExist(
        productId: string,
        qty_min: number,
        qty_max: number,
        promotionProductId?: string
    ): Promise<PromotionsProducts[]> {
        const query = getRepository(PromotionsProducts)
            .createQueryBuilder('pp')
            .select(['pp.id', 'pp.percentage', 'pp.qty_min', 'pp.qty_max'])
            .andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('pp1.id')
                    .from(PromotionsProducts, 'pp1')
                    .innerJoin(
                        Promotions,
                        'p',
                        'p.id = pp1.promotion_id AND pp1.product_id = :productId AND pp1.status = :activeStatus AND p.status = :activeStatus',
                        { productId, activeStatus: 'ACTIVE' }
                    )
                    .where((qb1) => {
                        const subQuery1 = qb1
                            .subQuery()
                            .select('p1.id')
                            .from(Promotions, 'p1')
                            .where('p.start_date <= p1.end_date')
                            .andWhere('p.end_date >= p1.start_date')
                            .getQuery();
                        return `p.id IN ${subQuery1}`;
                    })
                    .andWhere(':qty_min <= pp1.qty_max', { qty_min })
                    .andWhere(':qty_max >= pp1.qty_min', { qty_max })
                    .getQuery();
                return `pp.id IN ${subQuery}`;
            });

        if (promotionProductId) {
            query.andWhere('pp.id != :promotionProductId', { promotionProductId })
        }

        return query.getMany();
    }
    public async averageIds(productIds: string[]) {
        const query = this.createQueryBuilder('product_review')
            .select(['product_id'])
            .addSelect('ROUND(AVG(rating), 1)', 'averageRating')
            .groupBy('product_id');


        if (productIds.length !== 0) {
            query.where(`product_id in (${productIds.map((id) => `'${id}'`).join(', ')})`);
        }

        return query.getRawMany();
    }
}
