import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPromotionTable1642395446684 implements MigrationInterface {
    name = 'AlterPromotionTable1642395446684';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE promotions ADD COLUMN IF NOT EXISTS discount_percentage decimal DEFAULT 0;`);
        await queryRunner.query(`ALTER TABLE promotions ADD COLUMN IF NOT EXISTS max_discount_amount int DEFAULT 0;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
