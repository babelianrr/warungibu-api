import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductDiscountEndDate1634804932280 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_end_date TIMESTAMP WITH TIME ZONE;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS discount_end_date;`);
    }
}
