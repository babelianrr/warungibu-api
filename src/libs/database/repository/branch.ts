/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityRepository, Repository } from 'typeorm';
import { Branches } from 'src/models/branches';

@EntityRepository(Branches)
export class BranchRepository extends Repository<Branches> {
    findStockByProductSku(product_sku: string): Promise<Branches> {
        return this.createQueryBuilder('branches').where('product_sku = :sku', { sku: product_sku }).getOne();
    }

    updateStockSubs(branches: Branches, product_sku: string, quantity: number): Promise<any> {
        const currentStock = branches.stock - quantity;
        return this.createQueryBuilder('branches')
            .update(Branches)
            .set({
                stock: currentStock
            })
            .where('product_sku=:product_sku', { product_sku })
            .execute();
    }

    updateStockRevert(sku_number: string, quantity: number, branches: Branches): Promise<any> {
        const currentStock = quantity + branches.stock;
        return this.createQueryBuilder('branches')
            .update(Branches)
            .set({
                stock: currentStock
            })
            .where('product_sku=:product_sku', { product_sku: sku_number })
            .execute();
    }
    // findStockByProductSku(product_sku: string) {
    //     return this.findOne({ product_sku });
    // }
}
