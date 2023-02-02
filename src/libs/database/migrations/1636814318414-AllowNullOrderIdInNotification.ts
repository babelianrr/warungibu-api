import {MigrationInterface, QueryRunner} from "typeorm";

export class AllowNullOrderIdInNotification1636814318414 implements MigrationInterface {
    name = 'AllowNullOrderIdInNotification1636814318414';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN order_id DROP NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN order_id SET NOT NULL;`);
    }

}
