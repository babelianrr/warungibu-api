import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLoanLevelOnUser1636258013758 implements MigrationInterface {
    name = "AddLoanLevelOnUser1636258013758";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN loan_level varchar;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN loan_level;`);
    }

}
