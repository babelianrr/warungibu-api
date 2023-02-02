import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewPromotionTable1641268484474 implements MigrationInterface {
    name = 'AddNewPromotionTable1641268484474';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "promotions" 
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "code" varchar,
            "name" varchar NOT NULL,
            "start_date" date,
            "end_date" date,
            "status" varchar DEFAULT 'ACTIVE',
            "type" varchar,
            "max_usage_promo" int DEFAULT 0,
            "max_usage_user" int DEFAULT 0,
            "min_purchase" int DEFAULT 0,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());

        `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "promotions_products"
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "promotion_id" UUID NOT NULL,
            "product_id" UUID NOT NULL,
            "percentage" decimal DEFAULT 0,
            "qty_max" int DEFAULT 0,
            "qty_min" int DEFAULT 0,
            "status" varchar DEFAULT 'ACTIVE',
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            FOREIGN KEY (product_id) REFERENCES "products"(id),
            FOREIGN KEY (promotion_id) REFERENCES "promotions"(id));
        `);
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS promotion_id UUID;`);
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS promotion_discount int;`);
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_date date;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
