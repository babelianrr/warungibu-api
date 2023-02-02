import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPostalCodeType1632792075842 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE outlet_addresses 
            ALTER COLUMN postal_code TYPE INT USING postal_code::integer;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE outlet_addresses 
        ALTER COLUMN postal_code TYPE VARCHAR(255);
    `);
    }
}
