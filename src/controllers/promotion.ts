/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response, NextFunction } from 'express';
import { Promotions } from 'src/models/promotion';
import { PromotionsProducts } from 'src/models/promotion-product';
import qs from 'querystring';
import { adminAuthentication, authentication, IRequestExtra } from './middlewares/authentication';

export interface IPromotionService {
    findById(id: string): Promise<Promotions>;
    add(promoData: any): Promise<Promotions>;
    update(promoData: any): Promise<Promotions>;
    delete(id: string): Promise<any>;
    countAll(isAdmin: boolean, query?: any | string[]): Promise<any>;
    findWithFilter(queryString: any, userId?: string): Promise<Promotions[]>;
    findPromotionCode(findPromotionCode: any, userId: string): Promise<Promotions[]>;
}
export interface IPromotionProductService {
    findAll(): Promise<PromotionsProducts[]>;
    findById(id: string): Promise<PromotionsProducts>;
    add(promoData: any): Promise<PromotionsProducts>;
    update(promoData: any): Promise<PromotionsProducts>;
    delete(id: string): Promise<any>;
}

export class PromotionController {
    private readonly promotionService: IPromotionService;

    private readonly promotionProductService: IPromotionProductService;

    private readonly router: Router;

    public constructor(
        promotionsService: IPromotionService,
        promotionProductService: IPromotionProductService,
        type?: string
    ) {
        this.promotionService = promotionsService;
        this.promotionProductService = promotionProductService;
        this.router = Router();

        if (type === 'ADMIN') {
            this.router.use(adminAuthentication);
            this.router.get('/', this.get.bind(this));
            this.router.post('/', this.add.bind(this));
            this.router.get('/:id', this.getById.bind(this));
            this.router.patch('/:id', this.update.bind(this));
            this.router.delete('/:id', this.delete.bind(this));
            this.router.post('/:id', this.addPromotionProducts.bind(this));
            this.router.get('/detail/:id', this.getDetail.bind(this));
            this.router.patch('/detail/:id', this.updatePromotionProducts.bind(this));
        } else {
            this.router.use(authentication);
            this.router.get('/code', this.getPromotionCode.bind(this));
        }
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const query = qs.parse(req.url.substr(2, req.url.length));
            const promotions = await this.promotionService.findWithFilter(query);
            const { totalPromotions } = await this.promotionService.countAll(false, query);
            const totalPage = Math.ceil(Number(totalPromotions) / Number(query.limit));
            return res
                .status(200)
                .json({ page: Number(query.page), totalPage, promotions, totalPromotion: Number(totalPromotions) });
        } catch (err) {
            return next(err);
        }
    }

    public async getPromotionCode(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            if (!req.user) {
                return res.status(401).json('Unauthorized');
            }
            const query = qs.parse(req.url.substr(6, req.url.length));
            console.log(query);
            // query.bank = 'PT. Bank Rakyat Indonesia (Persero)';
            const promotions = await this.promotionService.findPromotionCode(query, req.user.id);
            return res.status(200).json(promotions);
        } catch (err) {
            return next(err);
        }
    }

    public async getDetail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const promotionProduct = await this.promotionProductService.findById(req.params.id);

            return res.status(200).json(promotionProduct);
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const promotions = await this.promotionService.findById(req.params.id);

            return res.status(200).json(promotions);
        } catch (err) {
            return next(err);
        }
    }

    public async add(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const category = await this.promotionService.add({
                code: req.body.code,
                name: req.body.name,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                type: req.body.type,
                min_purchase: req.body.min_purchase,
                max_usage_promo: req.body.max_usage_promo,
                max_usage_user: req.body.max_usage_user,
                discount_percentage: req.body.discount_percentage,
                max_discount_amount: req.body.max_discount_amount,
                status: req.body.status
            });

            console.log(`Admin with email: ${req.user.email} add category ${category.name}`);
            return res.status(201).json(category);
        } catch (err) {
            return next(err);
        }
    }

    public async addPromotionProducts(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const addData = {
                promotion_id: req.params.id,
                product_id: req.body.product_id,
                percentage: req.body.percentage,
                qty_max: req.body.qty_max,
                qty_min: req.body.qty_min,
                status: req.body.status
            };
            const promotionProduct = await this.promotionProductService.add(addData);

            console.log(`Admin with email: ${req.user.email} add promotionProduct ${req.params.id}`);
            return res.status(201).json(promotionProduct);
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        console.log('here');
        try {
            const category = await this.promotionService.update({
                id: req.params.id,
                end_date: req.body.end_date,
                start_date: req.body.start_date,
                name: req.body.name,
                discount_percentage: req.body.discount_percentage,
                max_discount_amount: req.body.max_discount_amount,
                status: req.body.status
            });

            console.log(`Admin with email: ${req.user.email} update promotion ${category.name}`);
            return res.status(200).json(category);
        } catch (err) {
            return next(err);
        }
    }

    public async updatePromotionProducts(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const promotionProduct = await this.promotionProductService.update({
                id: req.params.id,
                promotion_id: req.params.id,
                product_id: req.body.product_id,
                percentage: req.body.percentage,
                qty_max: req.body.qty_max,
                qty_min: req.body.qty_min,
                status: req.body.status
            });

            console.log(`Admin with email: ${req.user.email} update promotion product ${req.params.id}`);
            return res.status(200).json(promotionProduct);
        } catch (err) {
            return next(err);
        }
    }

    public async delete(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            await this.promotionService.delete(req.params.id);

            console.log(`Admin with email: ${req.user.email} delete promotion ${req.params.id}`);

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }

    public async deletePromotionProducts(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            await this.promotionProductService.delete(req.params.id);

            console.log(`Admin with email: ${req.user.email} delete promotion ${req.params.id}`);

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}
