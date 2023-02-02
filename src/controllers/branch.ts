/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response, NextFunction } from 'express';
import { Branches } from 'src/models/branches';

export interface IBranchService {
    findStockByProductSku(product_sku: any): Promise<Branches>;
}

export class BranchController {
    private readonly branchService: IBranchService;

    private router: Router;

    public constructor(branchService: IBranchService) {
        this.branchService = branchService;
        this.router = Router();
        this.router.get('/:sku', this.getStockBySku.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    async getStockBySku(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const Branches = await this.branchService.findStockByProductSku(req.params.sku);
            console.log(Branches);
            return res.status(200).json(Branches.stock);
        } catch (err) {
            return next(err);
        }
    }
}
