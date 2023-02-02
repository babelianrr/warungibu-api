import {MigrationInterface, QueryRunner} from "typeorm";

export class addIndexOrders1634287334128 implements MigrationInterface {
    name = 'addIndexOrders1634287334128';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_ord_txn`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_ord_txn ON "orders"(transaction_number)`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_ord_txn`);
    }

}
