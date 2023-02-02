import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1632290525869 implements MigrationInterface {
    name = 'init1632290525869';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" 
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "name" varchar NOT NULL,
            "customer_id" varchar UNIQUE,
            "email" varchar NOT NULL UNIQUE,
            "password" varchar,
            "birthdate" varchar NOT NULL,
            "ktp" varchar UNIQUE,
            "user_address" text,
            "gender" varchar NOT NULL,
            "phone_number" varchar NOT NULL,
            "role_status" varchar NOT NULL,
            "login_provider" varchar NOT NULL,
            "photo_url" varchar,
            "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());
        `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "outlets" 
            (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "type" varchar NOT NULL,
                "npwp" varchar NOT NULL UNIQUE,
                "telephone" varchar NOT NULL,
                "mobile_phone" varchar NOT NULL,
                "user_id" uuid,
                FOREIGN KEY (user_id) REFERENCES "users"(id),
                "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());
        `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "outlet_addresses" 
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "label" varchar NOT NULL,
            "receiver_name" varchar NOT NULL,
            "mobile_phone" varchar NOT NULL,
            "province" varchar NOT NULL,
            "city" varchar NOT NULL,
            "district" varchar NOT NULL,
            "subdistrict" varchar NOT NULL,
            "postal_code" varchar,
            "full_address" varchar,
            "status" varchar DEFAULT 'ACTIVE',
            "is_main" boolean DEFAULT 'FALSE',
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            "user_id" uuid NOT NULL,
            FOREIGN KEY (user_id) REFERENCES "users"(id),
            "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());
        `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "categories"
        (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "name" character varying(40) NOT NULL UNIQUE,
            "icon_url" character varying
        )`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "products"
        (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "name" character varying(80) NOT NULL,
            "picture_url" character varying,
            "sku_number" character varying NOT NULL UNIQUE,
            "company_name" character varying NOT NULL,
            "description" text,
            "unit" character varying NOT NULL,
            "slug" character varying NOT NULL,
            "price" int NOT NULL,
            "discount_price" int,
            "discount_percentage" int,
            "discount_type" character varying,
            "status" character varying NOT NULL,
            "valid_to" TIMESTAMP WITH TIME ZONE
        )`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "branches"
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "branch_code" character varying NOT NULL,
            "stock" int NOT NULL DEFAULT 0,
            "location" character varying,
            "product_sku" character varying,
            FOREIGN KEY (product_sku) REFERENCES products (sku_number)
        )`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "products_categories"
        (
            "product_id" UUID NOT NULL,
            "category_id" UUID NOT NULL,
            PRIMARY KEY (product_id, category_id),
            FOREIGN KEY (product_id) REFERENCES "products"(id),
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_prd_slug ON "products"(slug)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_prd_name ON "products"(name)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_prd_company_name ON "products"(company_name)`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "shipments"
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "courier" varchar NOT NULL,
            "track_number" varchar NOT NULL,
            "delivery_date" TIMESTAMP WITH TIME ZONE,
            "receive_date" TIMESTAMP WITH TIME ZONE,
            "receiver_name" varchar,
            "location" varchar NOT NULL,
            "price" int NOT NULL,
            "outlet_address_id" UUID NOT NULL,
            FOREIGN KEY (outlet_address_id) REFERENCES "outlet_addresses" (id)
        )`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "payments" 
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "method" varchar NOT NULL,
            "channel" varchar NOT NULL,
            "amount" int NOT NULL,
            "reference_number" varchar NOT NULL,
            "confirmed" boolean NOT NULL,
            "status" varchar NOT NULL,
            "events" jsonb NOT NULL,
            "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());
        `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "orders"
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "status" varchar,
            "expired_at" TIMESTAMP WITH TIME ZONE,
            "user_id" UUID NOT NULL,
            "payment_id" UUID,
            "shipment_id" UUID,
            FOREIGN KEY (user_id) REFERENCES "users" (id),
            FOREIGN KEY (payment_id) REFERENCES payments (id),
            FOREIGN KEY (shipment_id) REFERENCES shipments (id)
        )`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "carts"
        (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "quantity" int NOT NULL,
            "location" varchar,
            "final_unit_price" int NOT NULL,
            "status" varchar,
            "product_id" UUID NOT NULL,
            "user_id" UUID NOT NULL,
            "order_id" UUID,
            FOREIGN KEY (product_id) REFERENCES products (id),
            FOREIGN KEY (user_id) REFERENCES "users" (id),
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users";`);
        await queryRunner.query(`DROP TABLE "outlets";`);
    }
}
