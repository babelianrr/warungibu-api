import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductReviewTable1635349588834 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "product_reviews"
        (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "rating" int NOT NULL,
            "notes" character varying,
            "product_id" uuid,
            "user_id" uuid,
            "order_id" uuid,
            FOREIGN KEY (product_id) REFERENCES "products"(id),
            FOREIGN KEY (user_id) REFERENCES "users"(id),
            FOREIGN KEY (order_id) REFERENCES "orders"(id),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_reviews";`);
    }
}
