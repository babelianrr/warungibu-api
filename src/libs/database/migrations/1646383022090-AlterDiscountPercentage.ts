import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterDiscountPercentage1646383022090 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE carts
            ALTER COLUMN discount_percentage TYPE real;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
