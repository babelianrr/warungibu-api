/* eslint-disable no-await-in-loop */
import { getCustomRepository } from 'typeorm';

import '../module-alias';
import { connect } from 'src/db-connect';
import { returnLocalTime } from 'src/libs/helpers/date-only-comparison';
import { FlashSaleRepository } from 'src/libs/database/repository/flash-sale';
import { FlashSaleStatuses } from 'src/models/flash-sales';

(async () => {
    try {
        await connect();
        const flashSaleRepository = getCustomRepository(FlashSaleRepository);

        const now = new Date();
        const localDate = returnLocalTime(now);
        const dateOnly = `${localDate.getFullYear()}-${localDate.getMonth() + 1}-${localDate.getDate()}`;

        const activeFlashSale = await flashSaleRepository.getFlashSaleToActivate(dateOnly);
        const inactiveFlashSales = await flashSaleRepository.getFlashSaleToDeactivate(dateOnly);

        if (activeFlashSale) {
            activeFlashSale.status = FlashSaleStatuses.ACTIVE;
            await flashSaleRepository.save(activeFlashSale);
            console.log(`Flash sale "${activeFlashSale.notes}" is activated`);
        }

        console.log(`Deactivating ${inactiveFlashSales.length} flash sale`);
        for (let i = 0; i < inactiveFlashSales.length; i += 1) {
            inactiveFlashSales[i].status = FlashSaleStatuses.INACTIVE;
            await flashSaleRepository.save(inactiveFlashSales[i]);
        }
    } catch (err) {
        console.log(`error when running cron for flash sale:`, err);
        process.exit(1);
    } finally {
        console.log('Done');
        process.exit(0);
    }
})();
