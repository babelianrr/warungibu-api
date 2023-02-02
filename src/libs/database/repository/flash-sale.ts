/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FlashSales } from 'src/models/flash-sales';
import { EntityRepository, Repository, Brackets } from 'typeorm';

@EntityRepository(FlashSales)
export class FlashSaleRepository extends Repository<FlashSales> {
    findCollision(start: string, end: string) {
        return this.createQueryBuilder('flash_sale')
            .where(
                new Brackets((qb) => {
                    // eslint-disable-next-line prettier/prettier
                    qb.where('flash_sale.start_date <= :start', { start }).andWhere('flash_sale.end_date >= :start', {
                        start
                    });
                })
            )
            .orWhere(
                new Brackets((qb) => {
                    qb.where('flash_sale.start_date <= :end', { end }).andWhere('flash_sale.end_date >= :end', { end });
                })
            )
            .getOne();
    }

    getFlashSaleToActivate(date: string) {
        return this.createQueryBuilder('flash_sale')
            .where(`DATE_TRUNC('day', "start_date") = :date`, { date })
            .andWhere("flash_sale.status = 'INACTIVE'")
            .getOne();
    }

    getFlashSaleToDeactivate(date: string) {
        return this.createQueryBuilder('flash_sale')
            .where('flash_sale.end_date <= :date', { date })
            .andWhere("flash_sale.status = 'ACTIVE'")
            .getMany();
    }

    findOneWithProduct(id: string) {
        return this.createQueryBuilder('flash_sale')
            .leftJoinAndSelect('flash_sale.products', 'products')
            .where('flash_sale.id = :id', { id })
            .getOne();
    }
}
