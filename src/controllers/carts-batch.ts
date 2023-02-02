import { Router, Response, NextFunction } from 'express';
import { CartBatchService } from 'src/services/carts-batch';
import { ICartBatchCreate } from 'src/libs/database/repository/carts-batch';
import { /* adminAuthentication, */ IRequestExtra } from './middlewares/authentication';

export class CartBatchController {
    private readonly cartBatchService: CartBatchService;

    private router: Router;

    public constructor(cartBatchService: CartBatchService) {
        this.cartBatchService = cartBatchService;
        this.router = Router();

        this.router.get('/', this.getBatches.bind(this));
        this.router.get('/:id', this.getBatchesById.bind(this));
        this.router.post('/', this.createBatch.bind(this));
        this.router.patch('/:id', this.updateBatch.bind(this));
        this.router.delete('/:id', this.deleteBatch.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async getBatches(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.cartBatchService.get();
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async getBatchesById(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;
            const result = await this.cartBatchService.getByCartId(id);
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async createBatch(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const payload: ICartBatchCreate = {
                carts_id: req.body.carts_id,
                batch_no: req.body.batch_no,
                exp_date: req.body.exp_date,
                quantity: req.body.quantity
            };
            const result = await this.cartBatchService.create(payload);
            return res.status(201).json({
                ...result,
                exp_date: new Date(result.exp_date).toISOString()
            });
        } catch (err) {
            return next(err);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async updateBatch(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const payload = {
                id: req.params.id,
                batch_no: req.body.batch_no,
                exp_date: req.body.exp_date,
                quantity: req.body.quantity
            };

            const result = await this.cartBatchService.update(payload);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async deleteBatch(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await this.cartBatchService.delete(id);

            return res.status(200).send(`DELETED BATCH ID: ${id}`);
        } catch (err) {
            return next(err);
        }
    }
}
