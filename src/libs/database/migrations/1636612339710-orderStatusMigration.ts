import { MigrationInterface, QueryRunner } from 'typeorm';
import { OrderStatuses, Orders } from 'src/models/orders';
import { EPaymentStatus, Payments } from 'src/models/Payments';

export class orderStatusMigration1636612339710 implements MigrationInterface {
    name = 'orderStatusMigration1636612339710';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // migrate payment
        const allPayments = await queryRunner.manager.find(Payments);

        for (let i = 0; i < allPayments.length; i += 1) {
            const payment = allPayments[i];
            console.log(`Processing payment ${i + 1}, id ${payment.id}'`);
            const oldPaymentStatus: any = payment.status;

            switch (oldPaymentStatus) {
                case 'LOAN_SUCCESS':
                case 'COD':
                    payment.status = EPaymentStatus.PENDING;
                    break;
                default:
            }

            await queryRunner.manager.save(payment);
        }

        // migrate order
        const allOrders = await queryRunner.manager.find(Orders);

        for (let i = 0; i < allOrders.length; i += 1) {
            const order = allOrders[i];
            console.log(`Processing order ${i + 1}, id ${order.id}'`);
            const orderStatus: string = order.status;

            switch (orderStatus) {
                case 'PAID':
                    order.status = OrderStatuses.ORDERED;
                    break;
                case 'EXPIRED':
                case 'FAILED':
                case 'NEED_REFUND':
                case 'REFUNDED':
                    order.status = OrderStatuses.CANCELED;
                    break;
                default:
            }

            await queryRunner.manager.save(order);
        }

        const orders = await queryRunner.manager.find(Orders);

        console.log('Total:', orders.length);
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            if (order.status === OrderStatuses.DELIVERED) {
                order.completion_deadline = order.updated_at;
                await queryRunner.manager.save(order);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
