import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFlashSale1635240584107 implements MigrationInterface {
    name = 'CreateFlashSale1635240584107';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS flash_sales
        (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "notes" varchar,
            "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
            "status" varchar NOT NULL,
            "end_date" TIMESTAMP WITH TIME ZONE NOT NULL
        )`);

        await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_flash_sale boolean;`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_fs_status ON "flash_sales"(status)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE flash_sales`);
        await queryRunner.query(`ALTER TABLE products DROP COLUMN is_flash_sale;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_fs_status`);
    }

}
