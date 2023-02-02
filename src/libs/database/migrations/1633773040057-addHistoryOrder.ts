import { MigrationInterface, QueryRunner } from 'typeorm';

export class addHistoryOrder1633773040057 implements MigrationInterface {
    name = 'addHistoryOrder1633773040057';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_events jsonb;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE orders DROP COLUMN order_events;
        `);
    }
}
