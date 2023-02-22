/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Orders } from 'src/models/orders';
import { EntityRepository, Repository, Brackets } from 'typeorm';

@EntityRepository(Orders)
export class OrderRepository extends Repository<Orders> {
    findForUser(userId: string) {
        return this.createQueryBuilder('order')
            .select([
                'order.id',
                'order.transaction_number',
                'order.status',
                'order.expired_at',
                'order.created_at',
                'order.updated_at',
                'order.payment',
                'order.order_events',
                'order.completion_deadline',
                'payment.id',
                'payment.total_amount',
                'payment.status',
                'payment.method',
                'payment.type',
                'payment.channel',
                'payment.account_name',
                'payment.account_number',
                'payment.account_bank',
                'payment.reference_number',
                'payment.payment_reference_number',
                'payment.updated',
                'carts.id',
                'carts.quantity',
                'carts.location',
                'carts.final_unit_price',
                'carts.product',
                'carts.discount_percentage',
                'carts.unit_price',
                'product.id',
                'product.name',
                'product.slug',
                'product.price',
                'product.unit',
                'product.discount_price',
                'product.discount_type',
                'product.product_type',
                'product_image.url',
                'shipment.*'
            ])
            .leftJoin('order.payment', 'payment')
            .innerJoin('order.carts', 'carts', 'carts.order_id = order.id')
            .innerJoin('carts.product', 'product')
            .innerJoinAndSelect('order.shipment', 'shipment')
            .leftJoinAndSelect(
                'product.reviews',
                'review',
                'product.id = review.product_id AND review.order_id = order.id AND review.user_id = :user_id',
                { user_id: userId }
            )
            .leftJoin('product.images', 'product_image')
            .where('order.user_id = :user_id', { user_id: userId })
            .orderBy('order.created_at', 'DESC')
            .getMany();
    }

    findByIdForUser(userId: string, id: string) {
        return this.createQueryBuilder('order')
            .leftJoinAndSelect('order.payment', 'payment')
            .leftJoinAndSelect('order.shipment', 'shipment')
            .leftJoinAndSelect('shipment.address', 'address')
            .leftJoinAndSelect('order.carts', 'carts')
            .leftJoinAndSelect('carts.product', 'product')
            .leftJoinAndSelect('carts.batch', 'batch')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect(
                'product.reviews',
                'review',
                'product.id = review.product_id AND review.order_id = order.id AND review.user_id = :user_id',
                { user_id: userId }
            )
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('user.outlet_types_id', 'outlet_type')
            .where('order.user_id = :user_id', { user_id: userId })
            .andWhere('order.id = :id', { id })
            .getOne();
    }

    findOrderById(id: string) {
        return this.createQueryBuilder('order')
            .innerJoinAndSelect('order.payment', 'payment')
            .innerJoinAndSelect('order.carts', 'carts')
            .innerJoinAndSelect('carts.product', 'product')
            .innerJoinAndSelect('order.shipment', 'shipment')
            .leftJoinAndSelect('product.images', 'images')
            .where('order.id = :id', { id })
            .getOne();
    }

    getFakturByTransactionNumber(transaction_number: string) {
        return this.createQueryBuilder('order')
            .innerJoinAndSelect('order.payment', 'payment')
            .innerJoinAndSelect('order.carts', 'carts', 'carts.order_id = order.id AND carts.status != :deleted', {
                deleted: 'DELETED'
            })
            .innerJoinAndSelect('order.user', 'user')
            .innerJoinAndSelect('carts.product', 'product')
            .innerJoinAndSelect('order.shipment', 'shipment')
            .leftJoinAndSelect('user.outlet_types_id', 'outlet_type')
            .where('order.transaction_number = :transaction_number', { transaction_number })
            .getOne();
    }

    findOrderByTransactionNumber(transaction_number: string) {
        return this.createQueryBuilder('order')
            .innerJoinAndSelect('order.user', 'user')
            .innerJoinAndSelect('order.payment', 'payment')
            .innerJoinAndSelect('order.carts', 'carts', 'carts.order_id = order.id AND carts.status != :deleted', {
                deleted: 'DELETED'
            })
            .innerJoinAndSelect('carts.product', 'product')
            .innerJoinAndSelect('order.shipment', 'shipment')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('user.outlet_types_id', 'outlet_types_id')
            .where('order.transaction_number = :transaction_number', { transaction_number })
            .getOne();
    }

    findOrderByUserId(user_id: string) {
        return this.createQueryBuilder('order')
            .innerJoinAndSelect('order.payment', 'payment')
            .innerJoinAndSelect('order.carts', 'carts', 'carts.order_id = order.id AND carts.status != :deleted', {
                deleted: 'DELETED'
            })
            .innerJoinAndSelect('order.user', 'user')
            .innerJoinAndSelect('carts.product', 'product')
            .innerJoinAndSelect('order.shipment', 'shipment')
            .innerJoinAndSelect('shipment.address', 'address')
            .where('order.user_id = :user_id', { user_id })
            .andWhere('order.status = :status', { status: 'ORDERED' })
            .getMany();
    }

    findCompletedOrderByUserId(user_id: string) {
        return this.createQueryBuilder('order')
            .innerJoinAndSelect('order.payment', 'payment')
            .innerJoinAndSelect('order.carts', 'carts', 'carts.order_id = order.id AND carts.status != :deleted', {
                deleted: 'DELETED'
            })
            .innerJoinAndSelect('order.user', 'user')
            .innerJoinAndSelect('carts.product', 'product')
            .innerJoinAndSelect('order.shipment', 'shipment')
            .innerJoinAndSelect('shipment.address', 'address')
            .where('order.user_id = :user_id', { user_id })
            .andWhere('order.status = :status', { status: 'DELIVERED' })
            .andWhere('order.status = :status', { status: 'COMPLETED' })
            .getMany();
    }

    findOrderToExpire(currentTime: string) {
        return this.createQueryBuilder('order')
            .innerJoinAndSelect('order.payment', 'payment')
            .innerJoinAndSelect('order.carts', 'carts')
            .where(
                new Brackets((qb) => {
                    qb.where('payment.status = :stat', { stat: 'PENDING' })
                        .andWhere('payment.type = :pt', { pt: 'DIRECT' })
                        .andWhere('order.expired_at < :ct', { ct: currentTime });
                })
            )
            .orWhere(
                new Brackets((qb) => {
                    qb.where('payment.status = :status', { status: 'PENDING' })
                        .andWhere('payment.type = :payment_type', { payment_type: 'LOAN' })
                        .andWhere('payment.method = :payment_method', { payment_method: 'XENDIT_VA' })
                        .andWhere('order.expired_at < :currentTime', { currentTime });
                })
            )
            .getMany();
    }

    findForAdmin(query: any, exportExcel: boolean) {
        const ormQuery = this.createQueryBuilder('order')
            .select([
                'order.id',
                'order.transaction_number',
                'order.status',
                'order.expired_at',
                'order.created_at',
                'order.updated_at',
                'order.user_id',
                'order.payment',
                'payment.id',
                'payment.total_amount',
                'payment.status',
                'payment.method',
                'payment.type',
                'payment.account_number',
                'payment.account_name',
                'payment.account_bank',
                'carts.id',
                'carts.quantity',
                'carts.location',
                'carts.final_unit_price',
                'carts.product',
                'carts.discount_percentage',
                'carts.unit_price',
                'product.id',
                'product.name',
                'product.slug',
                'product.price',
                'product.unit',
                'product.discount_price',
                'product_image.url',
                'user.name',
                'user.customer_id',
                'user.outlet_types_id',
                'outlet_types.name'
            ])
            .leftJoin('order.payment', 'payment')
            .innerJoin('order.carts', 'carts', 'carts.order_id = order.id and carts.status != :deleted', {
                deleted: 'DELETED'
            })
            .innerJoin('order.user', 'user')
            .innerJoin('carts.product', 'product')
            .leftJoin('product.images', 'product_image')
            .leftJoin('user.outlet_types_id', 'outlet_types');

        if (query.status) {
            ormQuery.andWhere('order.status = :status', { status: query.status });
        }

        if (query.search) {
            ormQuery.andWhere('order.transaction_number ilike :search', { search: `%${query.search}%` });
        }

        if (query.client) {
            ormQuery.andWhere('outlet_types.name ilike :client', { client: `%${query.client}%` });
        }

        if (query.start_date && query.end_date) {
            ormQuery.andWhere('order.created_at between :start_date and :end_date', {
                start_date: `${query.start_date} 00:00:00.000`,
                end_date: `${query.end_date} 23:59:59.999`
            });
        }

        if (query.page && exportExcel === false) {
            ormQuery.take(Number(query.limit));
            ormQuery.skip(Number(query.limit) * (Number(query.page) - 1));
        }

        return ormQuery.orderBy('order.created_at', 'DESC').getMany();
    }

    countAll() {
        return this.createQueryBuilder('order').select('count(*)', 'totalOrder').getRawOne();
    }

    countFiltered(query: any) {
        const ormQuery = this.createQueryBuilder('order')
            .select('count(*)', 'total')
            .leftJoin('order.payment', 'payment')
            .innerJoin('order.carts', 'carts', 'carts.order_id = order.id and carts.status != :deleted', {
                deleted: 'DELETED'
            })
            .innerJoin('order.user', 'user')
            .innerJoin('carts.product', 'product')
            .leftJoin('product.images', 'product_image')
            .leftJoin('user.outlet_types_id', 'outlet_types');

        if (query.status) {
            ormQuery.andWhere('order.status = :status', { status: query.status });
        }

        if (query.search) {
            ormQuery.andWhere('order.transaction_number ilike :search', { search: `%${query.search}%` });
        }

        if (query.client) {
            ormQuery.andWhere('outlet_types.name ilike :client', { client: `%${query.client}%` });
        }

        if (query.start_date && query.end_date) {
            ormQuery.andWhere('order.created_at between :start_date and :end_date', {
                start_date: `${query.start_date} 00:00:00.000`,
                end_date: `${query.end_date} 23:59:59.999`
            });
        }

        return ormQuery.getRawOne();
    }

    countTotalTransaction() {
        return this.createQueryBuilder('')
            .where(`status not in ('CANCELED')`)
            .select('count(1)', 'totalTransaction')
            .getRawOne();
    }

    sumTotalSales() {
        return this.createQueryBuilder('order')
            .innerJoin('order.payment', 'payment')
            .select('SUM(payment.total_amount)', 'totalSales')
            .where(`order.status in ('COMPLETED', 'DELIVERED', 'PROCESSED')`)
            .getRawOne();

        // Uncomment this if want to sum Sales that already paid the order
        // .andWhere(`payment.status = 'SUCCESS'`)
    }

    findOrderToComplete(currentTime: string) {
        return this.createQueryBuilder('order')
            .where(`order.status = 'DELIVERED'`)
            .andWhere('order.completion_deadline < :currentTime', { currentTime })
            .getMany();
    }
}
