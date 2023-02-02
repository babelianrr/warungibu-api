import {MigrationInterface, QueryRunner} from "typeorm";

export class addDiscountInCart1635238647836 implements MigrationInterface {
    name = 'addDiscountInCart1635238647836';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE carts ADD COLUMN IF NOT EXISTS discount_percentage int;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE carts DROP COLUMN discount_percentage;`);
    }

}
