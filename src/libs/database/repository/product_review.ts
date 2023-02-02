/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductReviews } from 'src/models/Product-Reviews';
import { EntityRepository, Repository } from 'typeorm';

export interface IProductReviewRepo {
    findForProduct(productId: string, query: any): Promise<ProductReviews[]>;
    countAll(productId: string): Promise<any>;
    average(productId: string): Promise<any>;
    averageIds(productIds: string[]): Promise<any[]>;
}

@EntityRepository(ProductReviews)
export class ProductReviewRepository extends Repository<ProductReviews> {
    public async findForProduct(productId: string, query: any): Promise<ProductReviews[]> {
        const ormQuery = this.createQueryBuilder('product_review')
            .where('product_id = :productId', { productId })
            .innerJoinAndSelect('product_review.user', 'user');

        if (query.page) {
            ormQuery.take(Number(query.limit));
            ormQuery.skip(Number(query.limit) * (Number(query.page) - 1));
        }

        return ormQuery.getMany();
    }

    public async countAll(productId: string) {
        const ormQuery = this.createQueryBuilder('product_review')
            .select('count(1)', 'totalReview')
            .where('product_id = :productId', { productId });

        return ormQuery.getRawOne();
    }

    public async average(productId: string) {
        return this.createQueryBuilder('product_review')
            .select('ROUND(AVG(rating), 1)', 'averageRating')
            .where('product_id = :productId', { productId })
            .getRawOne();
    }

    public async averageIds(productIds: string[]): Promise<any[]> {
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
