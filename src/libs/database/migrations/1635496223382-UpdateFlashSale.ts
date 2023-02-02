import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateFlashSale1635496223382 implements MigrationInterface {
    name = 'UpdateFlashSale1635496223382';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS is_flash_sale;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "product_flash_sales"
            (
                "product_id" UUID NOT NULL,
                "flash_sale_id" UUID NOT NULL,
                PRIMARY KEY (product_id, flash_sale_id),
                FOREIGN KEY (product_id) REFERENCES "products"(id),
                FOREIGN KEY (flash_sale_id) REFERENCES flash_sales (id)
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE flash_sales;`);
    }

}
