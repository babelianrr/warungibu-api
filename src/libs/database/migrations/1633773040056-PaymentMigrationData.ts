import { MigrationInterface, QueryRunner } from 'typeorm';
import { Payments } from 'src/models/Payments';
import { EPaymentType } from 'src/models/Payments';

export class PaymentMigrationData1633773040056 implements MigrationInterface {
    name = 'PaymentMigrationData1633773040056';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // const allPayments = await queryRunner.manager.find(Payments);
        // for (let i = 0; i < allPayments.length; i += 1) {
        //     const payment = allPayments[i];
        //     console.log(`Processing ${i + 1}, id ${payment.id}'`);
        //     const oldPaymentMethod = payment.method;
        //     switch (oldPaymentMethod) {
        //         case 'XENDIT_VA':
        //         case 'BANK_TRANSFER':
        //             payment.type = EPaymentType.DIRECT;
        //             break;
        //         // case 'LOAN':
        //         //     payment.type = EPaymentType.LOAN;
        //         //     break;
        //         // case 'CASH_ON_DELIVERY':
        //         //     payment.type = EPaymentType.CASH_ON_DELIVERY;
        //         //     break;
        //         default:
        //     }
        // await queryRunner.manager.save(payment);
        // }
        // await queryRunner.query(`ALTER TABLE payments ALTER COLUMN type SET NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
