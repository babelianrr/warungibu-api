import {MigrationInterface, QueryRunner} from "typeorm";

export class addNotesOnOutletAddress1633177597655 implements MigrationInterface {
    name = 'addNotesOnOutletAddress1633177597655'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE outlet_addresses ADD COLUMN notes text;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE outlet_addresses DROP COLUMN notes;`);
    }

}
