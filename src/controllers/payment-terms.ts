import { Router, Response, NextFunction } from 'express';
import { PaymentTermsService } from 'src/services/payment-terms';
import { IPaymentTermsCreate } from 'src/libs/database/repository/payment-terms';
import { authentication, IRequestExtra } from './middlewares/authentication';

export class PaymentTermsController {
    private readonly paymentTermService: PaymentTermsService;

    private router: Router;

    public constructor(paymentTermService: PaymentTermsService) {
        this.paymentTermService = paymentTermService;
        this.router = Router();

        this.router.use(authentication);
        this.router.get('/', this.getPaymentTerms.bind(this));
        this.router.get('/active', this.getActivePaymentTerms.bind(this));
        this.router.post('/', this.getFilterPaymentTerms.bind(this));
        this.router.post('/create', this.createPaymentTerm.bind(this));
        this.router.put('/:id', this.updatePaymentTerm.bind(this));
        this.router.patch('/:id', this.changePaymentTermStat.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async getPaymentTerms(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.paymentTermService.get();
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async getFilterPaymentTerms(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const result = await this.paymentTermService.filter(req.body);
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async getActivePaymentTerms(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const result = await this.paymentTermService.getActive();
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async createPaymentTerm(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const payload: IPaymentTermsCreate = {
                type: req.body.type,
                name: req.body.name,
                days_due: req.body.days_due,
                status: req.body.status
            };

            const result = await this.paymentTermService.create(payload);

            return res.status(201).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async updatePaymentTerm(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const payload = {
                id: req.params.id,
                name: req.body.name,
                days_due: req.body.days_due
            };

            const result = await this.paymentTermService.update(payload);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async changePaymentTermStat(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const payload = {
                id: req.params.id,
                status: req.body.status
            };

            const result = await this.paymentTermService.update(payload);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }
}
