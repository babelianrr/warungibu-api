/* eslint-disable no-await-in-loop */
import { getCustomRepository } from 'typeorm';

import '../module-alias';
import { connect } from 'src/db-connect';
import { CartRepository } from 'src/libs/database/repository/cart';
import { OrderRepository } from 'src/libs/database/repository/order';
import { PaymentRepository } from 'src/libs/database/repository/Payment';
import { ShipmentRepository } from 'src/libs/database/repository/shipment';
import { UserRepository } from 'src/libs/database/repository/user';
import { OutletAddressRepository } from 'src/libs/database/repository/outlet_address';
import { OrderService } from 'src/services/order';
import { NotificationService } from 'src/services/notification';
import { NotificationMessage } from 'src/models/Notifications';
import { NotificationRepository } from 'src/libs/database/repository/notification';
import { ProductRepository } from 'src/libs/database/repository/product';
import { PromotionRepository } from 'src/libs/database/repository/promotion';
import { BranchRepository } from 'src/libs/database/repository/branch';
import { PaymentTermsRepository } from 'src/libs/database/repository/payment-terms';

(async () => {
    try {
        await connect();
        const branchRepository = getCustomRepository(BranchRepository);
        const orderRepository = getCustomRepository(OrderRepository);
        const userRepository = getCustomRepository(UserRepository);
        const outletAddressRepository = getCustomRepository(OutletAddressRepository);
        const shipmentRepository = getCustomRepository(ShipmentRepository);
        const paymentRepository = getCustomRepository(PaymentRepository);
        const cartRepository = getCustomRepository(CartRepository);
        const notificationRepository = getCustomRepository(NotificationRepository);
        const productRepository = getCustomRepository(ProductRepository);
        const promotionRepository = getCustomRepository(PromotionRepository);
        const paymentTermsRepository = getCustomRepository(PaymentTermsRepository);
        const orderService = new OrderService(
            orderRepository,
            userRepository,
            outletAddressRepository,
            shipmentRepository,
            paymentRepository,
            cartRepository,
            productRepository,
            promotionRepository,
            branchRepository,
            paymentTermsRepository
        );
        const notificationService = new NotificationService(notificationRepository);

        const ordersToExpire = await orderRepository.findOrderToExpire(new Date().toISOString());
        console.log(`total orders to processed: ${ordersToExpire.length}`);

        for (let i = 0; i < ordersToExpire.length; i += 1) {
            const order = ordersToExpire[i];
            console.log(`current order ${i + 1}: ${order.id}`);

            await orderService.expireOrder(order);
            await notificationService.createNotification(order.user_id, NotificationMessage.CANCELED, order.id);
        }
    } catch (err) {
        console.log(`error when expiring order:`, err);
        process.exit(1);
    } finally {
        console.log('Done');
        process.exit(0);
    }
})();
