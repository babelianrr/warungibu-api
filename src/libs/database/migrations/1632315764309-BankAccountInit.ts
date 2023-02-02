import { MigrationInterface, QueryRunner } from 'typeorm';

export class BankAccountInit1632312517078 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "bank_accounts"
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "bank_name" varchar NOT NULL,
            "account_number" varchar NOT NULL,
            "account_name" varchar NOT NULL,
            "branch_name" varchar NOT NULL,
            "status" varchar NOT NULL,
            "user_id" UUID NOT NULL,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
    }
}
