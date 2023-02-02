import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentAccountBank1633773040053 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE payments ADD COLUMN IF NOT EXISTS account_bank VARCHAR(100);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE payments DROP COLUMN account_bank VARCHAR(100);
        `);
    }
}
