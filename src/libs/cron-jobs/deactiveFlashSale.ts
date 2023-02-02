/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable consistent-return */
import cron from 'node-cron';
import { FlashSaleStatuses, FlashSales } from 'src/models/flash-sales';
import { FlashSaleRepository } from '../database/repository/flash-sale';

export const deactiveFlashSale = async (): Promise<any> => {
    cron.schedule('0 0 * * *', () => {
        try {
            const repo = new FlashSaleRepository();

            return repo
                .createQueryBuilder()
                .update(FlashSales)
                .set({ status: FlashSaleStatuses.INACTIVE })
                .where('flash_sale.end_date <= NOW()')
                .execute();
        } catch (err) {
            console.log(err);
        }
    });
};
