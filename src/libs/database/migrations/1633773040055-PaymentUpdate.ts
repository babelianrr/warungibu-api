import { MigrationInterface, QueryRunner } from 'typeorm';
import { Payments } from 'src/models/Payments';
import { EPaymentType } from 'src/models/Payments';

export class PaymentUpdate1633773040055 implements MigrationInterface {
    name = 'PaymentUpdate1633773040055';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('payment updateeee');
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS account_bank VARCHAR(100);`);
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS type varchar;`);
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_reference_number varchar;`);
        await queryRunner.query(`ALTER TABLE payments ALTER COLUMN method DROP NOT NULL;`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ord_txn ON "orders"(transaction_number)`);
        await queryRunner.query(`ALTER TABLE payments ALTER COLUMN type SET NOT NULL;`);

        const allPayments = await queryRunner.manager.find(Payments);
        for (let i = 0; i < allPayments.length; i += 1) {
            const payment = allPayments[i];
            console.log(`Processing ${i + 1}, id ${payment.id}'`);
            const oldPaymentMethod = payment.method;
            switch (oldPaymentMethod) {
                case 'XENDIT_VA':
                // case 'BANK_TRANSFER':
                //     payment.type = EPaymentType.DIRECT;
                //     break;
                // case 'LOAN':
                //     payment.type = EPaymentType.LOAN;
                //     break;
                // case 'CASH_ON_DELIVERY':
                //     payment.type = EPaymentType.CASH_ON_DELIVERY;
                //     break;
                default:
            }
            await queryRunner.manager.save(payment);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payments DROP COLUMN type;`);
    }
}
