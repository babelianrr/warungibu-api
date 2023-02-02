import { MigrationInterface, QueryRunner } from 'typeorm';
import { Products } from 'src/models/products';

export class AddSapPriceProduct1634831256066 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products ADD COLUMN sap_price int;`);

        const allProduct = await queryRunner.manager.find(Products);

        for (let i = 0; i < allProduct.length; i++) {
            const product = allProduct[i];
            console.log(`Processing product with id`, product.id);

            product.sap_price = product.price;
            await queryRunner.manager.save(product);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products DROP COLUMN sap_price;`);
    }
}
