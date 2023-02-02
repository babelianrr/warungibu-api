/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';

import { Branches } from 'src/models/branches';
import branch from '../clients/dnr/branch.json';
import branchLookup from '../clients/dnr/branch_lookup.json';

export interface IBranchRepo {
    findStockByProductSku(product_sku: any): Promise<Branches>;
}

export class BranchService {
    private repository: IBranchRepo;

    constructor(repository: IBranchRepo) {
        this.repository = repository;
    }

    async getBranchesLocale() {
        return branch;
    }

    getBranchLocal(code: string): string {
        return branchLookup[code] || 'not found';
    }

    async findStockByProductSku(product_sku: any): Promise<Branches> {
        try {
            console.log(`SKU = ${product_sku}`);
            const result = await this.repository.findStockByProductSku(product_sku);
            return result;
        } catch (error) {
            throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, error);
        }
    }

    async getStockInBranchLocal(productSku: any): Promise<Branches> {
        try {
            console.info(productSku);
            const response = await this.findStockByProductSku(productSku);
            return response;
            // return Number(response.data.data[0].stock);
        } catch (error) {
            throw new ErrorObject(
                ErrorCodes.CREATE_ORDER_ERROR,
                `Tidak Bisa Membuat Order Stock tidak tersedia untuk product ${productSku}.`,
                error
            );
        }
    }
}
