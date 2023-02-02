import {MigrationInterface, QueryRunner} from "typeorm";

export class addProductFavorites1634804932288 implements MigrationInterface {
    name = 'addProductFavorites1634804932288';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "product_favorites"
            (
                "product_id" UUID NOT NULL,
                "user_id" UUID NOT NULL,
                PRIMARY KEY (product_id, user_id),
                FOREIGN KEY (product_id) REFERENCES "products"(id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_favorites`);
    }

}
