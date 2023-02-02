import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNoRef1636015781498 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN noref_dplus varchar;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN noref_dplus;`);
    }
}
