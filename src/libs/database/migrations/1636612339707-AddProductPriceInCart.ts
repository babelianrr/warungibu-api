import { MigrationInterface, QueryRunner } from 'typeorm';
import { Carts } from 'src/models/carts';

export class AddProductPriceInCart1636612339707 implements MigrationInterface {
    name = 'AddProductPriceInCart1636612339707';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE carts ADD COLUMN IF NOT EXISTS unit_price int;
        `);

        const carts = await queryRunner.manager.find(Carts, { relations: ['product'] });

        for (let i = 0; i < carts.length; i += 1) {
            const cart = carts[i];

            cart.unit_price = cart.product.price;

            await queryRunner.manager.save(cart);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE news DROP COLUMN IF EXISTS unit_price;`);
    }
}
