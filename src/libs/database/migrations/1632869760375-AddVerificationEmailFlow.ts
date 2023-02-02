import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationEmailFlow1632869760375 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN verification_token varchar(60);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN verification_token;`);
    }
}
