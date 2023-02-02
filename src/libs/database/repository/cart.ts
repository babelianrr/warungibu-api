/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { startOfDay } from 'date-fns';
import { Carts } from 'src/models/carts';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Carts)
export class CartRepository extends Repository<Carts> {
    findForUser(userId: string) {
        return this.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .leftJoinAndSelect('product.images', 'images')
            .where('cart.user_id = :user_id', { user_id: userId })
            .andWhere('cart.status = :status', { status: 'ACTIVE' })
            .getMany();
    }

    findOneInvoiceCart(cartId: string, orderId: string) {
        return this.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .where('cart.id = :cart_id', { cart_id: cartId })
            .andWhere('cart.order_id = :order_id', { order_id: orderId })
            .andWhere('cart.status = :status', { status: 'ORDERED' })
            .getOne();
    }

    findOrderedCartByOrderId(orderId: string) {
        return this.createQueryBuilder('cart')
            .where('cart.order_id = :order_id', { order_id: orderId })
            .andWhere('cart.status = :status', { status: 'ORDERED' })
            .getMany();
    }

    findOneForUser(userId: string, id: string) {
        return this.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .where('cart.user_id = :user_id', { user_id: userId })
            .andWhere('cart.id = :id', { id })
            .andWhere('cart.status = :status', { status: 'ACTIVE' })
            .getOne();
    }

    findExistingCart(productId: string, userId: string, location: string) {
        return this.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .where('cart.user_id = :user_id', { user_id: userId })
            .andWhere('cart.product_id = :product_id', { product_id: productId })
            .andWhere('cart.location = :location', { location })
            .andWhere('cart.status = :status', { status: 'ACTIVE' })
            .getOne();
    }

    findExistingInvoiceCart(productId: string, orderId: string, location: string) {
        return this.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .where('cart.order_id = :order_id', { order_id: orderId })
            .andWhere('cart.product_id = :product_id', { product_id: productId })
            .andWhere('cart.location = :location', { location })
            .andWhere('cart.status = :status', { status: 'ORDERED' })
            .getOne();
    }

    findCompleteCartsByProductForToday(userId: string, productId: string) {
        return this.createQueryBuilder('cart')
            .select(['cart.id', 'cart.quantity', 'cart.order_id'])
            .where('cart.user_id = :user_id', { user_id: userId })
            .andWhere('cart.product_id = :product_id', { product_id: productId })
            .andWhere('cart.status = :status', { status: 'ORDERED' })
            .andWhere('cart.updated_at > :start_day', { start_day: startOfDay(new Date()) })
            .getMany();
    }

    findAllCompleteCartsByProduct(productId: string) {
        return this.createQueryBuilder('cart')
            .select(['cart.id', 'cart.quantity', 'cart.order_id'])
            .andWhere('cart.product_id = :product_id', { product_id: productId })
            .andWhere('cart.status = :status', { status: 'ORDERED' })
            .getMany();
    }

    sumAllCompleteCartsByProduct(productIds: string[]) {
        const productIdStringRaw = `(${productIds.map((id) => `'${id}'`).join(',')})`;

        const query = this.createQueryBuilder('cart')
            .select(['SUM(cart.quantity) as total_sales', 'product_id'])
            // .where(`cart.product_id in ${productIdStringRaw}`)
            .where(`cart.status = 'ORDERED'`)
            .innerJoin('cart.order', 'order')
            .andWhere(`order.status IN ('COMPLETED', 'DELIVERED')`)
            .groupBy('(product_id)');
        // .getRawMany();

        if (productIds.length !== 0) {
            query.andWhere(`cart.product_id in ${productIdStringRaw}`);
        }

        return query.getRawMany();
    }
}
