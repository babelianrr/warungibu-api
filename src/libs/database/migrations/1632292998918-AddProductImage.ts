import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductImage1632292998918 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "product_images"
        (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "url" character varying(200) NOT NULL,
            "product_id" uuid,
            FOREIGN KEY (product_id) REFERENCES "products"(id)
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_images"`);
    }
}
