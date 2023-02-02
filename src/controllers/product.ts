/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import qs from 'querystring';
import _ from 'underscore';

import { Router, Request, Response, NextFunction } from 'express';
import { Products, IProductCreateRequest, IProductUpdateRequest } from 'src/models/products';
import { BASE_URL } from 'src/config';
import {
    authentication,
    adminAuthentication,
    IRequestExtra,
    optionalAuthentication,
    superAdminAuth
} from './middlewares/authentication';
import { uploadHandler, setPrefixPath } from './middlewares/handle-upload';

interface IProductService {
    findWithFilter(queryString: any, userId?: string): Promise<Products[]>;
    findById(id: string, userId?: string): Promise<Products>;
    findTopProduct(userId: string, limit?: number): Promise<Products[]>;
    findByProductSku(product_sku: string): Promise<Products>;
    createOrUpdateFromSAP(input: IProductCreateRequest): Promise<Products>;
    findProductStock(id: string): Promise<any>;
    countAll(isAdmin: boolean, query?: any | string[]): Promise<any>;
    findAllForAdmin(queryString: any): Promise<Products[]>;
    updateProduct(input: IProductUpdateRequest, role: string): Promise<Products>;
    updateProductImage(id: string, images: any): Promise<Products>;
    removeProductImage(imageId: string): Promise<void>;
    addProductToFavorites(productId: string, userId: string): Promise<Products>;
    getFavoritesForUser(userId: string, query: any): Promise<Products[]>;
    countAllFavorites(userId: string): Promise<any>;
    removeProductFavorites(productId: string, userId: string): Promise<Products>;
    syncProduct(): Promise<any>;
    createNewProduct(input: IProductCreateRequest, role: string): Promise<Products>;
}

export class ProductController {
    private readonly productService: IProductService;

    private router: Router;

    public constructor(productService: IProductService, type?: string) {
        this.productService = productService;
        this.router = Router();

        if (type === 'ADMIN') {
            this.router.use(adminAuthentication);
            this.router.get('/', this.getAllForAdmin.bind(this));
            this.router.post('/', this.create.bind(this));
            this.router.get('/:id', this.getById.bind(this));
            this.router.patch('/:id', superAdminAuth, this.update.bind(this));
            this.router.patch(
                '/:id/upload',
                setPrefixPath('product_images'),
                uploadHandler.array('file'),
                this.uploadImages.bind(this)
            );
            this.router.post(
                '/upload',
                setPrefixPath('product_images'),
                uploadHandler.single('icon'),
                this.uploadSingleImage.bind(this)
            );
            this.router.delete('/images/:image_id', this.removeImage.bind(this));
            this.router.post('/sync-product', this.syncProduct.bind(this));
        } else {
            this.router.get('/', optionalAuthentication, this.get.bind(this));
            this.router.get('/top-product', optionalAuthentication, this.getTopProduct.bind(this));
            this.router.get('/favorites', authentication, this.getProductFavorites.bind(this));
            this.router.get('/:id', optionalAuthentication, this.getById.bind(this));
            this.router.post('/:id/favorites', authentication, this.addProductToFavorites.bind(this));
            this.router.delete('/:id/favorites', authentication, this.removeProductFavorites.bind(this));
        }
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            let userId: string;
            if (req.user) {
                userId = req.user.id;
            }
            const query = qs.parse(req.url.substr(2, req.url.length));
            const products = await this.productService.findWithFilter(query, userId);
            const { totalProduct } = await this.productService.countAll(false, query);
            const totalPage = Math.ceil(Number(totalProduct) / Number(query.limit));

            return res
                .status(200)
                .json({ page: Number(query.page), totalPage, products, totalProduct: Number(totalProduct) });
        } catch (err) {
            return next(err);
        }
    }

    public async getAllForAdmin(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const query = qs.parse(req.url.substr(2, req.url.length));
            const products = await this.productService.findAllForAdmin(query);
            const { totalProduct } = await this.productService.countAll(true, query);
            const totalPage = Math.ceil(Number(totalProduct) / Number(query.limit));

            return res.status(200).json({ page: Number(query.page), totalPage, products });
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            let userId;
            if (req.user) {
                userId = req.user.id;
            }
            const product = await this.productService.findById(req.params.id, userId);
            // const stocks = await this.productService.findProductStock(product.sku_number);
            // product.branches = stocks;

            return res.status(200).json(product);
        } catch (err) {
            return next(err);
        }
    }

    public async getTopProduct(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            let userId: string;
            if (req.user) {
                userId = req.user.id;
            }
            const product = await this.productService.findTopProduct(userId, Number(req.query.limit));

            return res.status(200).json(product);
        } catch (err) {
            return next(err);
        }
    }

    public async create(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const images = [];
            const branches = [];
            for (let i = 0; i < req.body.picture.length; i += 1) {
                const image = {
                    url: req.body.picture[i]
                };
                images.push(image);
            }
            for (let i = 0; i < req.body.branches.length; i += 1) {
                const branch = {
                    branch_code: '1204',
                    location: 'Cakung',
                    stock: req.body.branches[i]
                };
                branches.push(branch);
            }

            const validTok = new Date(req.body.valid_to).toISOString();
            console.log(validTok);
            let productData: any = {
                name: req.body.name,
                description: req.body.description,
                company_name: req.body.company_name,
                sku_number: req.body.sku_number,
                unit: req.body.unit,
                discount_percentage: req.body.discount_percentage,
                discount_price: req.body.discount_price,
                valid_to: validTok,
                status: req.body.status,
                categories: req.body.categories,
                price: req.body.price,
                sap_price: req.body.price,
                images,
                branches
            };

            productData = _.omit(productData, (value, key, obj) => {
                return _.isUndefined(value) || _.isNull(value);
            });

            const product = await this.productService.createNewProduct(productData, req.user.role);

            console.log(`Admin ${req.user.email} create product ${product.sku_number}`);

            return res.status(201).json(product);
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const branches = [];

            for (let i = 0; i < req.body.branches.length; i += 1) {
                const branch = {
                    branch_code: '1204',
                    location: 'Cakung',
                    stock: req.body.branches[i],
                    product_sku: req.body.product_sku
                };
                branches.push(branch);
            }
            const validTok = new Date(req.body.valid_to).toISOString();
            let productData: any = {
                id: req.params.id,
                description: req.body.description,
                unit: req.body.unit,
                discount_percentage: req.body.discount_percentage,
                discount_price: req.body.discount_price,
                valid_to: validTok,
                status: req.body.status,
                categories: req.body.categories,
                price: req.body.price,
                dpf: req.body.dpf,
                branches
            };

            if (req.body.discount_end_date) {
                productData.discount_end_date = `${req.body.discount_end_date} 00:00:00+07`;
            }

            productData = _.omit(productData, (value, key, obj) => {
                return _.isUndefined(value) || _.isNull(value);
            });

            const product = await this.productService.updateProduct(productData, req.user.role);

            console.log(`Admin ${req.user.email} update product ${product.sku_number}`);
            return res.status(200).json(product);
        } catch (err) {
            return next(err);
        }
    }

    public async uploadImages(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const product = await this.productService.updateProductImage(req.params.id, { files: req.files });

            console.log(`Admin ${req.user.email} upload images for product ${product.sku_number}`);
            return res.status(200).json(product);
        } catch (err) {
            return next(err);
        }
    }

    public async uploadSingleImage(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            return res.status(200).json({
                url: `${BASE_URL}/product_images/${req.file.filename}`
            });
        } catch (err) {
            return next(err);
        }
    }

    public async removeImage(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            await this.productService.removeProductImage(req.params.image_id);

            console.log(`Admin ${req.user.email} remove product image with id ${req.params.id}`);
            return res.status(200).json({ status: 'OK' });
        } catch (err) {
            return next(err);
        }
    }

    public async addProductToFavorites(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const product = await this.productService.addProductToFavorites(req.params.id, req.user.id);

            return res.status(200).json(product);
        } catch (err) {
            return next(err);
        }
    }

    public async getProductFavorites(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const query = qs.parse(req.url.substr(11, req.url.length));
            const products = await this.productService.getFavoritesForUser(req.user.id, query);
            const { totalProduct } = await this.productService.countAllFavorites(req.user.id);
            const totalPage = Math.ceil(Number(totalProduct) / Number(query.limit));

            return res.status(200).json({ page: Number(query.page), totalPage, products });
        } catch (err) {
            return next(err);
        }
    }

    public async removeProductFavorites(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            await this.productService.removeProductFavorites(req.params.id, req.user.id);

            return res.status(200).json({ status: 'OK' });
        } catch (err) {
            return next(err);
        }
    }

    public async syncProduct(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.productService.syncProduct();
            console.log(`Admin ${req.user.email} run product sync at ${new Date().toISOString()}`);
            return res.status(200).json({
                message: `Berhasil memperbarui ${result.active_product} produk dan menonaktifkan ${result.inactive_product} produk.`
            });
        } catch (err) {
            return next(err);
        }
    }
}
