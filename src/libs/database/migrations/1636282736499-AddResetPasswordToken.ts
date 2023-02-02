import {MigrationInterface, QueryRunner} from "typeorm";

export class AddResetPasswordToken1636282736499 implements MigrationInterface {
    name = 'AddResetPasswordToken1636282736499';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN reset_password_token varchar;`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN reset_password_expired_at TIMESTAMP WITH TIME ZONE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN reset_password_token;`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN reset_password_expired_at;`);
    }

}
