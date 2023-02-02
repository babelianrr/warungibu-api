import {MigrationInterface, QueryRunner} from "typeorm";

export class updateGenderBirthdateBecomeNull1632765333461 implements MigrationInterface {
    name = 'updateGenderBirthdateBecomeNull1632765333461'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE Users ALTER COLUMN birthdate DROP NOT NULL;`);
        await queryRunner.query(`ALTER TABLE Users ALTER COLUMN gender DROP NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE Users ALTER COLUMN birthdate SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE Users ALTER COLUMN gender SET NOT NULL;`);

    }

}
