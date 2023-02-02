import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryCascade1634840975165 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "products_categories" DROP CONSTRAINT "products_categories_category_id_fkey"`
        );
        await queryRunner.query(
            `ALTER TABLE "products_categories" ADD FOREIGN KEY ("category_id") REFERENCES "public"."categories" ("id") ON DELETE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "products_categories" DROP CONSTRAINT "products_categories_category_id_fkey"`
        );
        await queryRunner.query(
            `ALTER TABLE "products_categories" ADD FOREIGN KEY ("category_id") REFERENCES "public"."categories" ("id")`
        );
    }
}
