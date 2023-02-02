import {MigrationInterface, QueryRunner} from "typeorm";

import { ProductTestSeed } from 'src/libs/database/seeding/product-test-seed';
import { ProductRepository } from 'src/libs/database/repository/product';
import { CategoryRepository } from 'src/libs/database/repository/category';
import { ProductService } from 'src/services/product';

export class ProductTestSeeder1632312677092 implements MigrationInterface {
    name = 'ProductTestSeeder1632312677092';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const productRepository = queryRunner.connection.getCustomRepository(ProductRepository);
        const categoryRepository = queryRunner.connection.getCustomRepository(CategoryRepository);
        const productService = new ProductService(productRepository, categoryRepository);

        for (let i = 0; i < ProductTestSeed.length; i += 1) {
            await productService.createOrUpdateFromSAP(ProductTestSeed[i]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
