import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDpf1633773040061 implements MigrationInterface {
    name = 'AddDpf1633773040061';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS dpf varchar;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS dpf;`);
    }
}
