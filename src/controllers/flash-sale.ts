/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, Request, Response, NextFunction } from 'express';
import { FlashSales, IFlashSaleCreateRequest } from 'src/models/flash-sales';
import { adminAuthentication, IRequestExtra, optionalAuthentication } from './middlewares/authentication';

interface IFlashSaleService {
    getAllForAdmin(): Promise<FlashSales[]>;
    getActiveFlashSale(userId: string, take?: number): Promise<FlashSales>;
    createFlashSale(data: IFlashSaleCreateRequest): Promise<FlashSales>;
    getFlashSaleById(id: string): Promise<FlashSales>;
    updateFlashSale(data: IFlashSaleCreateRequest): Promise<FlashSales>;
    disableFlashSale(id: string): Promise<FlashSales>;
    activateFlashSale(id: string): Promise<FlashSales>;
    addProductsToFlashSale(flashSaleId: string, productIds: string[]): Promise<FlashSales>;
    removeProductsFromFlashSale(flashSaleId: string, productIds: string[]): Promise<FlashSales>;
}

export class FlashSaleController {
    private readonly flashSaleService: IFlashSaleService;

    private router: Router;

    public constructor(flashSaleService: IFlashSaleService, type?: string) {
        this.flashSaleService = flashSaleService;
        this.router = Router();

        if (type === 'ADMIN') {
            this.router.use(adminAuthentication);
            this.router.post('/', this.createFlashSale.bind(this));
            this.router.get('/', this.getAllForAdmin.bind(this));
            this.router.get('/:id', this.getById.bind(this));
            this.router.patch('/:id', this.updateFlashSale.bind(this));
            this.router.post('/:id/deactivate', this.disableFlashSale.bind(this));
            this.router.post('/:id/activate', this.activateFlashSale.bind(this));
            this.router.post('/:id/add-products', this.addProductsToFlashSale.bind(this));
            this.router.post('/:id/remove-products', this.removeProductsFromFlashSale.bind(this));
        } else {
            this.router.use(optionalAuthentication);
            this.router.get('/', this.getActiveFlashSale.bind(this));
        }
    }

    getRouter(): Router {
        return this.router;
    }

    public async getActiveFlashSale(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            let userId;
            if (req.user) {
                userId = req.user.id;
            }

            const sales = [];
            const flashSale = await this.flashSaleService.getActiveFlashSale(userId, Number(req.query.limit));
            if (flashSale) {
                sales.push(flashSale);
            }

            return res.status(200).json(sales);
        } catch (err) {
            return next(err);
        }
    }

    public async getAllForAdmin(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const flashSales = await this.flashSaleService.getAllForAdmin();
            console.log(
                'file: flash-sale.ts ~ line 68 ~ FlashSaleController ~ getAllForAdmin ~ flashSales',
                flashSales
            );
            return res.status(200).json(flashSales);
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const flashSale = await this.flashSaleService.getFlashSaleById(req.params.id);
            return res.status(200).json(flashSale);
        } catch (err) {
            return next(err);
        }
    }

    public async createFlashSale(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const createDate = {
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                notes: req.body.notes
            };

            console.log(createDate, 'Payload create flash sale');
            const flashSale = await this.flashSaleService.createFlashSale(createDate);
            return res.status(201).json(flashSale);
        } catch (err) {
            return next(err);
        }
    }

    public async updateFlashSale(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const updateData = {
                id: req.params.id,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                notes: req.body.notes
            };
            const flashSale = await this.flashSaleService.updateFlashSale(updateData);
            return res.status(200).json(flashSale);
        } catch (err) {
            return next(err);
        }
    }

    public async disableFlashSale(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const flashSale = await this.flashSaleService.disableFlashSale(req.params.id);
            return res.status(200).json(flashSale);
        } catch (err) {
            return next(err);
        }
    }

    public async activateFlashSale(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const flashSale = await this.flashSaleService.activateFlashSale(req.params.id);
            return res.status(200).json(flashSale);
        } catch (err) {
            return next(err);
        }
    }

    public async addProductsToFlashSale(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const productIds = req.body.product_ids;
            const flashSale = await this.flashSaleService.addProductsToFlashSale(req.params.id, productIds);
            return res.status(200).json(flashSale);
        } catch (err) {
            return next(err);
        }
    }

    public async removeProductsFromFlashSale(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const productIds = req.body.product_ids;
            const flashSale = await this.flashSaleService.removeProductsFromFlashSale(req.params.id, productIds);
            return res.status(200).json(flashSale);
        } catch (err) {
            return next(err);
        }
    }
}
