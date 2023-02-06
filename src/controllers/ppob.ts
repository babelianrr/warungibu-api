/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, NextFunction, Response } from 'express';
import { Ppob } from 'src/models/ppobs';
import { IOrderService } from 'src/services/order';
import { EPaymentMethod, EPaymentType } from 'src/models/Payments';
import { Orders } from 'src/models/orders';
import { ErrorObject } from 'src/libs/error-object';
import { ProductService } from 'src/services/product';
import { addDays } from 'date-fns';
import { EProductTypes, ProductStatuses } from 'src/models/products';
import { IRequestExtra, adminAuthentication, authentication } from './middlewares/authentication';
import { ICartService } from './cart';

interface IPpobService {
    findForAdmin(): Promise<Ppob[]>;
    findOne(options?: any): Promise<Ppob>;
    findOneByIdForAdmin(id: string): Promise<Ppob>;
    findForUser(category: string): Promise<Ppob[]>;
    findCategoryForUser(clause?: any): Promise<Ppob[]>;
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

    private productService: ProductService;

    private cartService: ICartService;

    private router: Router;

    public constructor(
        ppobService: IPpobService,
        orderService: IOrderService,
        productService: ProductService,
        cartService: ICartService,
        type?: string
    ) {
        this.ppobService = ppobService;
        this.orderService = orderService;
        this.productService = productService;
        this.cartService = cartService;
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
            this.router.get('/:category', this.getForUser.bind(this));
            this.router.get('/', this.getCategoryForUser.bind(this));
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
            const data = await this.ppobService.findForUser(req.params.category);

            return res.status(200).json({ data });
        } catch (err) {
            return next(err);
        }
    }

    public async getCategoryForUser(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const data = await this.ppobService.findCategoryForUser(req.query.category);

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
            const buyerSkuCode = `${result.buyer_sku_code}`.toUpperCase();
            const product = await this.productService.findPpobByProductSku(buyerSkuCode);

            if (!product) {
                throw new ErrorObject('404', 'Produk tidak ditemukan', {
                    buyer_sku_code: buyerSkuCode
                });
            }

            let order: Orders;
            if (result.status === 'Sukses') {
                const cart = await this.cartService.addToCart({
                    product_id: product.id,
                    location: 'Gudang',
                    quantity: 1,
                    user_id: req.user.id
                });

                order = await this.orderService.createPpobOrder({
                    shipment: {
                        location: 'Gudang'
                    },
                    payment: {
                        total_price: product.price,
                        payment_type: EPaymentType.LOAN,
                        payment_method: EPaymentMethod.LOAN
                    },
                    user_id: req.user.id,
                    carts: [cart.id],
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
            const result = await this.ppobService.syncDataAdmin();

            if (result.kept_data.length !== 0) {
                await this.productService.deleteSync(result.kept_data);
            }

            await Promise.all(
                result.data.map(async (v: Ppob) => {
                    const product = await this.productService.findPpobByProductSku(v.buyer_sku_code);
                    if (product) {
                        await this.productService.updateProduct(
                            {
                                id: product.id,
                                name: v.product_name,
                                status: v.active === true ? ProductStatuses.ACTIVE : ProductStatuses.INACTIVE,
                                price: v.sell_price
                            },
                            req.user.role
                        );
                    } else {
                        await this.productService.createNewProduct(
                            {
                                name: v.product_name,
                                sku_number: v.buyer_sku_code,
                                company_name: v.seller_name,
                                unit: 'UNIT',
                                price: v.sell_price,
                                valid_to: addDays(Date.now(), 365).toISOString(),
                                product_type: EProductTypes.PPOB,
                                branches: [
                                    {
                                        branch_code: '1204',
                                        location: 'Gudang',
                                        stock: 9999
                                    }
                                ],
                                status: v.active === true ? ProductStatuses.ACTIVE : ProductStatuses.INACTIVE
                            },
                            req.user.role
                        );
                    }
                })
            );
            return res.status(200).json({ message: 'Successfully synched data', data: result.data });
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const ppob = await this.ppobService.findOneByIdForAdmin(req.body.id);

            if (!ppob) {
                throw new ErrorObject('404', 'PPOB tidak ditemukan.', {
                    id: req.body.id
                });
            }

            const product = await this.productService.findPpobByProductSku(ppob.buyer_sku_code);

            if (!product) {
                throw new ErrorObject('404', 'Produk tidak ditemukan.', {
                    sku_number: ppob.buyer_sku_code
                });
            }

            await this.ppobService.update(req.body, req.body.id);

            await this.productService.updateProduct(
                {
                    id: product.id,
                    name: ppob.product_name,
                    status: ppob.active === true ? ProductStatuses.ACTIVE : ProductStatuses.INACTIVE,
                    price: ppob.sell_price
                },
                req.user.role
            );

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
