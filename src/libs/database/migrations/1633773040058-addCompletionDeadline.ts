import { MigrationInterface, QueryRunner } from 'typeorm';
import { OrderStatuses, Orders } from 'src/models/orders';

export class addCompletionDeadline1633773040058 implements MigrationInterface {
    name = 'addCompletionDeadline1633773040058';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE orders ADD COLUMN IF NOT EXISTS completion_deadline TIMESTAMP WITH TIME ZONE;`
        );

        // const orders = await queryRunner.manager.find(Orders);

        // console.log('Total:', orders.length);
        // for (let i = 0; i < orders.length; i++) {
        //     const order = orders[i];

        //     if (order.status === OrderStatuses.DELIVERED) {
        //         order.completion_deadline = order.updated_at;
        //         await queryRunner.manager.save(order);
        //     }
        // }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE orders DROP COLUMN expired_at`);
    }
}
