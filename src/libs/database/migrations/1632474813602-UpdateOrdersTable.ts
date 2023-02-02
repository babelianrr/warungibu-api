import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateOrdersTable1632474813602 implements MigrationInterface {
    name = 'UpdateOrdersTable1632474813602';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN transaction_number varchar;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN transaction_number;`);
    }

}
