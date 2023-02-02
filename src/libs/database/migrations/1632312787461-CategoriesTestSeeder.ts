import {MigrationInterface, QueryRunner} from "typeorm";

import { Categories } from 'src/models/categories';
import { CategoryTestSeed } from 'src/libs/database/seeding/category-test-seed';

export class CategoriesTestSeeder1632312787461 implements MigrationInterface {
    name = 'CategoriesTestSeeder1632312787461';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.insert(Categories, CategoryTestSeed);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
