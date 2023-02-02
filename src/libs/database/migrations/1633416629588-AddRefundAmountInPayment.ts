import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRefundAmountInPayment1633416629588 implements MigrationInterface {
    name = 'AddRefundAmountInPayment1633416629588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN refund_amount int;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payments DROP COLUMN refund_amount;`);
    }

}
