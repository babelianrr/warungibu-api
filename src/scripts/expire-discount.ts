/* eslint-disable no-await-in-loop */
import { getCustomRepository } from 'typeorm';

import '../module-alias';
import { connect } from 'src/db-connect';
import { returnLocalTime } from 'src/libs/helpers/date-only-comparison';
import { ProductRepository } from 'src/libs/database/repository/product';

(async () => {
    try {
        await connect();
        const productRepository = getCustomRepository(ProductRepository);

        const now = new Date();
        const localDate = returnLocalTime(now);
        const dateOnly = `${localDate.getFullYear()}-${localDate.getMonth() + 1}-${localDate.getDate()}`;

        const expiredDiscountProducts = await productRepository.getExpiredDiscount(dateOnly);

        for (let i = 0; i < expiredDiscountProducts.length; i += 1) {
            const product = expiredDiscountProducts[i];
            console.log(`Removing discount for product id`, product.id);

            product.discount_percentage = 0;
            product.discount_price = 0;
            product.discount_type = null;

            await productRepository.save(product);
        }
    } catch (err) {
        console.log(`error when running cron for expired product discount:`, err);
        process.exit(1);
    } finally {
        console.log('Done');
        process.exit(0);
    }
})();
