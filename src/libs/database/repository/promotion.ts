import { EntityRepository, Repository } from 'typeorm';
import { Promotions } from 'src/models/promotion';
import { Payments } from 'src/models/Payments';
import { Orders } from 'src/models/orders';

export interface IQueryPromotions {
    name?: string;
    sort_by?: string;
    order?: string;
    limit?: string;
    page?: string;
}

export interface IQueryPromotionCode {
    code: string;
    bank_code: string;
    total_amount: number;
}

@EntityRepository(Promotions)
export class PromotionRepository extends Repository<Promotions> {
    findByCode(code: string) {
        return this.findOne({ code });
    }

    findAllSorted() {
        return this.createQueryBuilder('promotions').orderBy('created_at').getMany();
    }

    findWithFilter(query: IQueryPromotions) {
        const ormQuery = this.createQueryBuilder('promotions');

        const filteredQuery = this.filterQuery(ormQuery, query, {
            withOrderBy: true,
            basicOrderBy: true
        });

        if (query.page) {
            filteredQuery.take(Number(query.limit));
            filteredQuery.skip(Number(query.limit) * (Number(query.page) - 1));
        }
        return filteredQuery.getMany();
    }

    findPromotionCode(query: IQueryPromotionCode, userId: string) {
        const currDate = new Date().toISOString().slice(0, 10);
        const ormQuery = this.createQueryBuilder('promotions')
            .leftJoinAndSelect(
                (qb) =>
                    qb.select(['count(p.promotion_code) as total_user_usage', 'p.promotion_code'])
                        .from(Payments, 'p')
                        .innerJoin(Orders, 'o', 'p.id = o.payment_id and o.user_id = :userId', { userId })
                        .where('p.status = :success', { success: 'SUCCESS' })
                        .groupBy('p.promotion_code'),
                'max_user_usage',
                'promotions.code = max_user_usage.p_promotion_code' // the answer
            )
            .leftJoinAndSelect(
                (qb) =>
                    qb
                        .select(['count(p.promotion_code) as total_promo_usage', 'p.promotion_code'])
                        .from(Payments, 'p')
                        .where('p.status = :success', { success: 'SUCCESS' })
                        .groupBy('p.promotion_code'),
                'max_promo_usage',
                'promotions.code = max_promo_usage.p_promotion_code' // the answer
            )
            .where('promotions.type = :code', { code: 'CODE' })
            .andWhere('promotions.status = :active', { active: 'ACTIVE' })
            .andWhere('start_date <= :currDate', { currDate })
            .andWhere(':currDate <= end_date', { currDate })
            .andWhere('coalesce(max_user_usage.total_user_usage, 0) < promotions.max_usage_user')
            .andWhere('coalesce(max_promo_usage.total_promo_usage, 0) < promotions.max_usage_promo');

        if (query.code) {
            ormQuery.andWhere('promotions.code = :promoCode', { promoCode: query.code });
        }

        if (query.total_amount) {
            ormQuery.andWhere('promotions.min_purchase <= :totalAmount', { totalAmount: query.total_amount });
        }

        return ormQuery.getMany();
        // check bank by bank code here
    }

    countAll(isAdmin: boolean, query?: any) {
        const ormQuery = this.createQueryBuilder('promotions').select('count(1)', 'totalPromotions');

        const filteredQuery = this.filterQuery(ormQuery, query, { basicOrderBy: false });

        return filteredQuery.getRawOne();
    }

    private filterQuery(ormQuery, query, option) {
        const { withOrderBy = true, basicOrderBy = false } = option;
        let where = 0;

        if (query.name && query.name.length) {
            ormQuery.andWhere(`promotions.name ilike :name`, { name: `%${query.name}%` });
            where += 1;
        }

        if (query.status) {
            if (where > 0) {
                ormQuery.andWhere('promotions.status = :status', { status: query.status });
            } else {
                ormQuery.where('promotions.status = :status', { status: query.status });
            }
        }

        if (basicOrderBy) {
            ormQuery.orderBy('status', 'ASC', 'NULLS LAST');
            ormQuery.addOrderBy('created_at', 'DESC', 'NULLS LAST');
        }

        if (query.sort_by && query.sort_by.length && withOrderBy) {
            const map = {
                START_DATE: 'promotions.start_date',
                END_DATE: 'promotions.end_date'
            };

            const sortKey = map[query.sort_by];

            if (query.order && query.order === 'DESC') {
                ormQuery.orderBy(sortKey, 'DESC', 'NULLS LAST');
            } else {
                ormQuery.orderBy(sortKey, 'ASC', 'NULLS LAST');
            }
        }

        return ormQuery;
    }
}
