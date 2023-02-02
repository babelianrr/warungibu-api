import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatePaymentsTable1632412173325 implements MigrationInterface {
    name = 'UpdatePaymentsTable1632412173325';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN confirmed;`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN amount to product_price;`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN channel DROP NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN reference_number DROP NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN shipment_fee int NOT NULL DEFAULT 0;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN tax int NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN order_discount int NOT NULL DEFAULT 0;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN unique_amount int NOT NULL DEFAULT 0;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN channel_fee int NOT NULL DEFAULT 0;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN total_amount int NOT NULL DEFAULT 0;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN account_name varchar;`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN account_number varchar;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN confirmed boolean;`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN product_price to amount;`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN channel SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN reference_number DROP NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN shipment_fee;`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN tax;`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN order_discount;`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN unique_amount;`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN channel_fee;`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN total_amount;`);
    }

}
