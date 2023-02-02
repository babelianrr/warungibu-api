/* eslint-disable */
import { getCustomRepository } from 'typeorm';

import '../module-alias';
import { DNR } from 'src/clients/dnr/dnr';
import { connect } from 'src/db-connect';
import { ProductService } from 'src/services/product';
import { CategoryRepository } from 'src/libs/database/repository/category';
import { ProductRepository } from 'src/libs/database/repository/product';

(async () => {
    try {
        await connect();

        const productRepository = getCustomRepository(ProductRepository);
        const categoryRepository = getCustomRepository(CategoryRepository);

        const productService = new ProductService(productRepository, categoryRepository);

        const result = await productService.syncProduct();
        console.log(`Berhasil memperbarui ${result.active_product} produk dan menonaktifkan ${result.inactive_product} produk.`)
    } catch (err) {
        console.log(err);
        process.exit(1);
    } finally {
        console.log('Done');
        process.exit();
    }
})();
