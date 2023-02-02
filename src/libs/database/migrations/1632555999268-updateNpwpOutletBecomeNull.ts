import {MigrationInterface, QueryRunner} from "typeorm";

export class updateNpwpOutletBecomeNull1632555999268 implements MigrationInterface {
    name = 'updateNpwpOutletBecomeNull1632555999268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE Outlets ALTER COLUMN npwp DROP NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE Outlets ALTER COLUMN npwp SET NOT NULL;`);
    }

}
