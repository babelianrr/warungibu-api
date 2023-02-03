/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EProductTypes, ProductStatuses, Products } from 'src/models/products';
import { PromotionsProducts } from 'src/models/promotion-product';
import { EntityRepository, Repository, Brackets, getRepository, getManager } from 'typeorm';
import { Promotions } from 'src/models/promotion';
import { ProductImages } from 'src/models/Product-Images';

export interface IQueryProducts {
    name?: string;
    category?: string;
    slug?: string;
    company_name?: string;
    sort_by?: string;
    order?: string;
    limit?: string;
    page?: string;
    min_price?: string;
    max_price?: string;
    rating?: string;
}

@EntityRepository(Products)
export class ProductRepository extends Repository<Products> {
    findWithFilter(query: IQueryProducts, isAdmin: boolean) {
        const ormQuery = this.createQueryBuilder('product')
            .select([
                'product.id',
                'product.name',
                'product.picture_url',
                'product.slug',
                'product.unit',
                'product.price',
                'product.discount_percentage',
                'product.discount_price',
                'product.discount_type',
                'product.valid_to',
                'product.description',
                'product.sku_number',
                'product.sap_price',
                'product.dpf',
                'product.created_at',
                'product.product_type'
            ])
            .leftJoinAndSelect('product.images', 'images.url')
            .leftJoinAndSelect('product.branches', 'branches')
            .where('product.status = :status', { status: ProductStatuses.ACTIVE })
            .andWhere('product.product_type = :type', { type: EProductTypes.GENERAL })
            .orderBy('product.created_at', 'DESC');

        const filteredQuery = this.filterQuery(ormQuery, query, isAdmin, {
            skipSelectCategory: false,
            withOrderBy: true
        });

        if (query.page) {
            filteredQuery.take(Number(query.limit));
            filteredQuery.skip(Number(query.limit) * (Number(query.page) - 1));
        }
        return filteredQuery.getMany();
    }

    findByProductSku(product_sku: string) {
        return this.createQueryBuilder('product')
            .leftJoinAndSelect('product.branches', 'branches')
            .where('product.sku_number = :sku', { sku: product_sku })
            .getOne();
    }

    findPpobByProductSku(product_sku: string) {
        return this.createQueryBuilder('product')
            .where('product.sku_number = :sku', { sku: product_sku })
            .andWhere('product.product_type = :type', { type: EProductTypes.PPOB })
            .getOne();
    }

    findTopProduct(limit?: number) {
        const entityManager = getManager();
        const someQuery = entityManager.query(`SELECT
                                                    pd."id",
                                                    pd."name",
                                                    pd.sku_number,
                                                    pd.description,
                                                    pd.unit,
                                                    pd.slug,
                                                    pd.price,
                                                    pd.sap_price,
                                                    pd.discount_price,
                                                    CASE
                                                        WHEN pm.status = 'ACTIVE' 
                                                        AND pm.start_date <= CURRENT_DATE 
                                                        AND pm.end_date >= CURRENT_DATE THEN
                                                            MAX ( pr.percentage ) ELSE 0 
                                                    END percentage,
                                                    pd.discount_type,
                                                    pd.valid_to,
                                                    MAX ( br.stock ) 
                                                FROM
                                                    products AS pd
                                                    INNER JOIN promotions_products AS pr ON pd."id" = pr.product_id
                                                    INNER JOIN branches AS br ON pd.sku_number = br.product_sku
                                                    INNER JOIN promotions AS pm ON pr.promotion_id = pm."id" 
                                                WHERE
                                                    pd.status = 'ACTIVE' 
                                                    AND br.stock > 0 
                                                    AND pr.status = 'ACTIVE'
                                                GROUP BY
                                                    pd."id",
                                                    pd."name",
                                                    pd.sku_number,
                                                    pd.description,
                                                    pd.unit,
                                                    pd.slug,
                                                    pd.price,
                                                    pd.sap_price,
                                                    pd.discount_price,
                                                    pd.discount_type,
                                                    pd.valid_to,
                                                    pm.status,
                                                    pm.start_date,
                                                    pm.end_date 
                                                ORDER BY
                                                    percentage DESC 
                                                LIMIT ${limit}`);
        return someQuery;
    }

    countAll(isAdmin: boolean, query?: any) {
        const ormQuery = this.createQueryBuilder('product')
            .select('count(1)', 'totalProduct')
            .where('product.status = :status', { status: 'ACTIVE' });

        const filteredQuery = this.filterQuery(ormQuery, query, isAdmin, {
            skipSelectCategory: true,
            withOrderBy: false
        });

        return filteredQuery.getRawOne();
    }

    findFavoritesForUser(userId: string, query: any) {
        const ormQuery = this.createQueryBuilder('product')
            .select([
                'product.id',
                'product.name',
                'product.picture_url',
                'product.slug',
                'product.unit',
                'product.price',
                'product.discount_percentage',
                'product.discount_price',
                'product.discount_type',
                'product.valid_to',
                'product.description',
                'product.sku_number'
            ])
            .leftJoinAndSelect('product.images', 'images.url')
            .innerJoin('product.fav_by', 'fav_by', 'fav_by.id = :userId', {
                userId
            });

        if (query.sort_by && query.sort_by.length) {
            if (query.order && query.order === 'DESC') {
                ormQuery.orderBy(query.sort_by, 'DESC');
            } else if (query.order && query.order === 'ASC') {
                ormQuery.orderBy(query.sort_by, 'ASC');
            } else {
                ormQuery.orderBy(query.sort_by);
            }
        }

        if (query.page) {
            ormQuery.take(Number(query.limit));
            ormQuery.skip(Number(query.limit) * (Number(query.page) - 1));
        }

        return ormQuery.getMany();
    }

    countAllFavorites(userId: string) {
        const ormQuery = this.createQueryBuilder('product')
            .select('count(1)', 'totalProduct')
            .innerJoin('product.fav_by', 'fav_by', 'fav_by.id = :userId', {
                userId
            });

        return ormQuery.getRawOne();
    }

    checkFavorite(productId: string, userId: string): Promise<Products> {
        return this.createQueryBuilder('product')
            .innerJoin('product.fav_by', 'fav_by', 'fav_by.id = :userId', {
                userId
            })
            .where('product.id = :productId', { productId })
            .getOne();
    }

    checkOnSale(productId: string): Promise<Products> {
        return this.createQueryBuilder('product')
            .innerJoin('product.flash_sale', 'flash_sale', 'product.id = :productId', {
                productId
            })
            .where(`flash_sale.status = 'ACTIVE'`)
            .getOne();
    }

    findInactiveProducts(activeProductId: string[]): Promise<Products[]> {
        return this.createQueryBuilder('product')
            .where(`sku_number not in (${activeProductId.map((id) => `'${id}'`).join(', ')})`)
            .getMany();
    }

    deactivateProduct(inactiveProductId: string[]): Promise<any> {
        return this.createQueryBuilder('product')
            .update()
            .set({ valid_to: null })
            .where(`id in  (${inactiveProductId.map((id) => `'${id}'`).join(', ')})`)
            .execute();
    }

    getExpiredDiscount(date: string) {
        return this.createQueryBuilder('product').where(`discount_end_date <= :date`, { date }).getMany();
    }

    private filterQuery(ormQuery, query, isAdmin, option) {
        const { skipSelectCategory = false, withOrderBy = true } = option;
        if (!isAdmin) {
            ormQuery.andWhere('product.valid_to >= :date', { date: new Date() });
        }

        if (query.name && query.name.length) {
            ormQuery.andWhere(`product.name ilike :name`, { name: `%${query.name}%` });
        }

        if (query.category && query.category.length) {
            if (skipSelectCategory) {
                ormQuery.innerJoin('product.categories', 'categories', 'categories.name = :categoryName', {
                    categoryName: query.category
                });
            } else {
                ormQuery.innerJoinAndSelect('product.categories', 'categories', 'categories.name = :categoryName', {
                    categoryName: query.category
                });
            }
        }

        if (query.slug && query.slug.length) {
            ormQuery.andWhere(`product.slug = :slug`, { slug: query.slug });
        }

        if (query.company_name && query.company_name.length) {
            ormQuery.andWhere(`product.company_name = :cn`, { cn: query.company_name });
        }

        if (query.sort_by && query.sort_by.length && withOrderBy) {
            const map = {
                PRICE: 'product.price',
                RATE: 'average_rating',
                TOP_SALES: 'total_sell'
            };

            const sortKey = map[query.sort_by];

            if (query.sort_by === 'RATE') {
                ormQuery.addSelect((subQuery) => {
                    return subQuery
                        .select('ROUND(AVG(rating), 1)', 'averageRating')
                        .from('product_reviews', 'product_reviews')
                        .where('product_reviews.product_id = product.id');
                }, 'average_rating');
            }

            if (query.sort_by === 'TOP_SALES') {
                ormQuery.addSelect((subQuery) => {
                    return subQuery
                        .select(`SUM(carts.quantity)`, 'totalSell')
                        .from('carts', 'carts')
                        .innerJoin('carts.order', 'order')
                        .where('carts.product_id = product.id')
                        .andWhere(`order.status IN ('COMPLETED', 'DELIVERED')`);
                }, 'total_sell');
            }

            if (query.order && query.order === 'DESC') {
                ormQuery.orderBy(sortKey, 'DESC', 'NULLS LAST');
            } else {
                ormQuery.orderBy(sortKey, 'ASC', 'NULLS LAST');
            }
        }

        if (query.min_price) {
            ormQuery.andWhere('product.price >= :minPrice', { minPrice: Number(query.min_price) });
        }

        if (query.max_price) {
            ormQuery.andWhere('product.price <= :maxPrice', { maxPrice: Number(query.max_price) });
        }

        if (query.rating) {
            ormQuery.andWhere(
                `(
                SELECT
                    ROUND(AVG(rating), 1) AS "averageRating"
                FROM
                    "product_reviews" "product_reviews"
                WHERE
                    "product_reviews"."product_id" = "product"."id") >= :rating`,
                { rating: query.rating }
            );
        }

        if (query.status) {
            if (query.status === 'ACTIVE') {
                ormQuery.andWhere('product.valid_to >= :date', { date: new Date() });
            } else {
                ormQuery.andWhere(
                    new Brackets((qb) => {
                        qb.where('product.valid_to < :date', { date: new Date() }).orWhere('product.valid_to IS NULL');
                    })
                );
            }
        }

        return ormQuery;
    }

    findPromotionForProductById(productId: string): Promise<any[]> {
        return getRepository(PromotionsProducts)
            .createQueryBuilder('promotions_products')
            .select([
                'promotions_products.id',
                'promotions_products.percentage',
                'promotions_products.qty_min',
                'promotions_products.qty_max',
                'promotions.id as promotionId'
            ])
            .innerJoin(Promotions, 'promotions', 'promotions.id = promotions_products.promotion_id')
            .where('promotions_products.product_id = :productID', { productID: productId })
            .andWhere('promotions.type = :promotionType', { promotionType: 'TIERED' })
            .andWhere('promotions.status = :promotionStatus', { promotionStatus: 'ACTIVE' })
            .andWhere('promotions_products.status = :promotionProductStatus', { promotionProductStatus: 'ACTIVE' })
            .andWhere('promotions.start_date <= :nowDate', { nowDate: new Date().toISOString().slice(0, 10) })
            .andWhere(':nowDate <= promotions.end_date', { nowDate: new Date().toISOString().slice(0, 10) })
            .orderBy('promotions_products.percentage', 'DESC')
            .getMany();
    }

    findProductImagesForProductById(productId: string): Promise<any[]> {
        return getRepository(ProductImages)
            .createQueryBuilder('product_images')
            .select(['product_images.id', 'product_images.url', 'product_images.product_id'])
            .where('product_images.product_id = :productID', { productID: productId })
            .getMany();
    }

    findPromotionHeaderForProductById(productId: string): Promise<any[]> {
        return getRepository(Promotions)
            .createQueryBuilder('promotions')
            .select('promotions')
            .innerJoin(PromotionsProducts, 'promotions_products', 'promotions.id = promotions_products.promotion_id')
            .where('promotions_products.product_id = :productID', { productID: productId })
            .andWhere('promotions.type = :promotionType', { promotionType: 'TIERED' })
            .andWhere('promotions.status = :promotionStatus', { promotionStatus: 'ACTIVE' })
            .andWhere('promotions_products.status = :promotionProductStatus', { promotionProductStatus: 'ACTIVE' })
            .andWhere('promotions.start_date <= :nowDate', { nowDate: new Date().toISOString().slice(0, 10) })
            .andWhere(':nowDate <= promotions.end_date', { nowDate: new Date().toISOString().slice(0, 10) })
            .orderBy('promotions_products.qty_min')
            .getMany();
    }

    deleteSync(payload: string[]): Promise<any> {
        return this.createQueryBuilder()
            .delete()
            .from(Products)
            .where('sku_number NOT IN (:payload)', { payload })
            .andWhere('product_type = :type', { type: EProductTypes.PPOB })
            .execute();
    }
}
