/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, NextFunction, Response } from 'express';
import { Ppob } from 'src/models/ppobs';
import { IOrderService } from 'src/services/order';
import { EPaymentMethod } from 'src/models/Payments';
import { Orders } from 'src/models/orders';
import { ErrorObject } from 'src/libs/error-object';
import { IRequestExtra, adminAuthentication, authentication } from './middlewares/authentication';

interface IPpobService {
    findForAdmin(): Promise<Ppob[]>;
    findOne(options?: any): Promise<Ppob>;
    findForUser(category: string): Promise<Ppob[]>;
    checkoutForUser(customer_no: string, buyer_sku_code?: string): Promise<any>;
    transactionByUser(buyer_sku_code: string, customer_no: string): Promise<any>;
    checkTransactionByUser(payload: any): Promise<any>;
    fetchDigiflazz(): Promise<any>;
    syncDataAdmin(): Promise<any>;
    update(payload: any, id: string): Promise<any>;
    delete(id: string): Promise<any>;
}

export class PpobController {
    private readonly ppobService: IPpobService;

    private orderService: IOrderService;

    private router: Router;

    public constructor(ppobService: IPpobService, orderService: IOrderService, type?: string) {
        this.ppobService = ppobService;
        this.orderService = orderService;
        this.router = Router();

        if (type === 'ADMIN') {
            this.router.use(adminAuthentication);
            this.router.get('/', this.get.bind(this));
            this.router.get('/fetch', this.getDigiflazz.bind(this));
            this.router.post('/sync', this.syncData.bind(this));
            this.router.patch('/update', this.update.bind(this));
            this.router.post('/:ref_id/check', this.checkTransactionByUser.bind(this));
        } else {
            this.router.use(authentication);
            this.router.get('/', this.getForUser.bind(this));
            this.router.post('/', this.transactionByUser.bind(this));
            this.router.post('/checkout', this.checkoutByUser.bind(this));
            this.router.post('/:ref_id/check', this.checkTransactionByUser.bind(this));
        }
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = await this.ppobService.findForAdmin();

            return res.status(200).json({ data });
        } catch (err) {
            return next(err);
        }
    }

    public async getForUser(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = await this.ppobService.findForUser(req.body.category);

            return res.status(200).json({ data });
        } catch (err) {
            return next(err);
        }
    }

    public async checkoutByUser(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = await this.ppobService.checkoutForUser(req.body.customer_no, req.body.buyer_sku_code);

            return res.status(200).json(data);
        } catch (err) {
            return next(err);
        }
    }

    public async transactionByUser(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.ppobService.transactionByUser(req.body.customer_no, req.body.buyer_sku_code);
            const ppob = await this.ppobService.findOne(result.buyer_sku_code);

            if (!ppob) {
                throw new ErrorObject('404', 'PPOB tidak ditemukan', {
                    buyer_sku_code: result.buyer_sku_code
                });
            }

            let order: Orders;
            if (result.status === 'Sukses') {
                order = await this.orderService.createPpobOrder({
                    payment: {
                        total_price: ppob.sell_price,
                        payment_method: EPaymentMethod.LOAN
                    },
                    user_id: req.user.id,
                    ref_id: result.ref_id
                });
            }

            return res.status(200).json({ result, order });
        } catch (err) {
            return next(err);
        }
    }

    public async checkTransactionByUser(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const data = await this.ppobService.checkTransactionByUser({
                ref_id: req.params.ref_id,
                buyer_sku_code: req.body.buyer_sku_code,
                customer_no: req.body.customer_no
            });

            return res.status(200).json(data);
        } catch (err) {
            return next(err);
        }
    }

    public async getDigiflazz(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = await this.ppobService.fetchDigiflazz();

            return res.status(200).json({ data });
        } catch (err) {
            return next(err);
        }
    }

    public async syncData(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = await this.ppobService.syncDataAdmin();

            return res.status(200).json({ message: 'Successfully synched data', data });
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            await this.ppobService.update(req.body, req.body.id);

            return res.status(200).json({ message: 'Successfully updated data' });
        } catch (err) {
            return next(err);
        }
    }

    public async delete(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            await this.ppobService.delete(req.body.id);

            return res.status(200).json({ message: 'Successfully deleted data' });
        } catch (err) {
            return next(err);
        }
    }
}
