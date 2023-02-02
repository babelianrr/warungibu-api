/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import { FlashSales, FlashSaleStatuses, IFlashSaleCreateRequest } from 'src/models/flash-sales';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { compareDate } from 'src/libs/helpers/date-only-comparison';
import { IProductRepo } from 'src/services/product';
import { IProductReviewRepo } from 'src/libs/database/repository/product_review';
import { IOrderService } from './order';

interface IFlashSaleRepo {
    find(query?: any): Promise<FlashSales[]>;
    findOne(query: any): Promise<FlashSales>;
    create(data: any): FlashSales;
    save(data: any): Promise<FlashSales>;
    findCollision(start: string, end: string): Promise<FlashSales>;
    getFlashSaleToActivate(date: string): Promise<FlashSales>;
    getFlashSaleToDeactivate(date: string): Promise<FlashSales[]>;
    findOneWithProduct(id: string): Promise<FlashSales>;
}

export class FlashSaleService {
    private repository: IFlashSaleRepo;

    private productRepository: IProductRepo;

    private reviewRepo: IProductReviewRepo;

    private orderService: IOrderService;

    constructor(
        repository: IFlashSaleRepo,
        productRepo: IProductRepo,
        reviewRepo: IProductReviewRepo,
        orderService: IOrderService
    ) {
        this.repository = repository;
        this.productRepository = productRepo;
        this.reviewRepo = reviewRepo;
        this.orderService = orderService;
    }

    public async getAllForAdmin(): Promise<FlashSales[]> {
        return this.repository.find();
    }

    public async getActiveFlashSale(userId: string, take?: number): Promise<FlashSales> {
        const flashSale = await this.repository.findOne({
            where: {
                status: FlashSaleStatuses.ACTIVE
            }
        });

        if (!flashSale) {
            return null;
        }

        console.log(flashSale, 'flash sale');

        let ratings = [];

        if (flashSale.products.length !== 0) {
            const ids = flashSale.products.map((product) => product.id);
            console.log('file: flash-sale.ts ~ line 59 ~ FlashSaleService ~ getActiveFlashSale ~ ids', ids);
            ratings = await this.reviewRepo.averageIds(ids);
            console.log('file: flash-sale.ts ~ line 61 ~ FlashSaleService ~ getActiveFlashSale ~ ratings', ratings);
        }

        const products = [];

        for (let i = 0; i < flashSale.products.length; i += 1) {
            const product = flashSale.products[i];
            const rating = ratings.find((data) => data.product_id === product.id);
            const productSold = await this.orderService.getNumberOfProductSold(product.id);

            product.sold = productSold;
            product.average_rating = rating ? Number(rating.averageRating) : null;

            if (userId) {
                const fav = await this.productRepository.checkFavorite(product.id, userId);
                product.is_favorite = !!fav;
            } else {
                product.is_favorite = false;
                delete product.price;
                delete product.sap_price;
            }

            products.push(product);
        }
        flashSale.products = products;

        return flashSale;
    }

    public async getFlashSaleById(id: string): Promise<FlashSales> {
        return this.repository.findOne(id);
    }

    public async createFlashSale(data: IFlashSaleCreateRequest): Promise<FlashSales> {
        const now = new Date();
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);

        const newData: IFlashSaleCreateRequest = {
            ...data,
            start_date: `${data.start_date} 00:00:00+07`,
            end_date: `${data.end_date} 00:00:00+07`
        };

        if (compareDate(start, now) === -1) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_ERROR, 'Tanggal mulai flash sale sudah lewat');
        }

        if (compareDate(start, end) === 1) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_ERROR, 'Tanggal akhir harus setelah tanggal mulai');
        }

        // if (await this.isPromoDateCollide(data.start_date, data.end_date)) {
        //     throw new ErrorObject(
        //         ErrorCodes.FLASH_SALE_ERROR,
        //         'Tanggal flash sale bentrok dengan flash sale yang sudah ada'
        //     );
        // }

        const newFlashSale = this.repository.create(newData);

        if (compareDate(now, start) >= 0 && compareDate(now, end) <= 0) {
            newFlashSale.status = FlashSaleStatuses.ACTIVE;
        } else {
            newFlashSale.status = FlashSaleStatuses.INACTIVE;
        }

        return this.repository.save(newFlashSale);
    }

    public async updateFlashSale(data: IFlashSaleCreateRequest): Promise<FlashSales> {
        const now = new Date();
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);

        const newData: IFlashSaleCreateRequest = {
            ...data,
            start_date: `${data.start_date} 00:00:00+07`,
            end_date: `${data.end_date} 00:00:00+07`
        };

        if (compareDate(start, now) === -1) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_ERROR, 'Tanggal mulai flash sale sudah lewat');
        }

        if (compareDate(start, end) === 1) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_ERROR, 'Tanggal akhir harus setelah tanggal mulai');
        }

        // if (await this.isPromoDateCollide(data.start_date, data.end_date)) {
        //     throw new ErrorObject(
        //         ErrorCodes.FLASH_SALE_ERROR,
        //         'Tanggal flash sale bentrok dengan flash sale yang sudah ada'
        //     );
        // }

        const flashSale = await this.repository.findOne(data.id);

        if (!flashSale) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_NOT_FOUND_ERROR, 'Flash sale tidak ditemukan');
        }

        const newFlashSale = {
            ...flashSale,
            ...newData
        };

        if (compareDate(now, start) >= 0 && compareDate(now, end) <= 0) {
            newFlashSale.status = FlashSaleStatuses.ACTIVE;
        } else {
            newFlashSale.status = FlashSaleStatuses.INACTIVE;
        }

        return this.repository.save(newFlashSale);
    }

    public async disableFlashSale(id: string): Promise<FlashSales> {
        const flashSale = await this.repository.findOne(id);

        if (!flashSale) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_NOT_FOUND_ERROR, 'Flash sale tidak ditemukan');
        }

        flashSale.status = FlashSaleStatuses.INACTIVE;

        return this.repository.save(flashSale);
    }

    public async activateFlashSale(id: string): Promise<FlashSales> {
        const flashSale = await this.repository.findOne(id);

        if (!flashSale) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_NOT_FOUND_ERROR, 'Flash sale tidak ditemukan');
        }

        const now = new Date();
        const start = new Date(flashSale.start_date);
        const end = new Date(flashSale.end_date);
        if (compareDate(now, start) === -1 || compareDate(now, end) === 1) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_ERROR, 'Tanggal hari ini tidak ada dalam range flash sale');
        }

        flashSale.status = FlashSaleStatuses.ACTIVE;

        return this.repository.save(flashSale);
    }

    public async addProductsToFlashSale(flashSaleId: string, productIds: string[]): Promise<FlashSales> {
        const flashSale = await this.repository.findOneWithProduct(flashSaleId);

        if (!flashSale) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_NOT_FOUND_ERROR, 'Flash sale tidak ditemukan');
        }

        const productsOnSale = flashSale.products;

        for (let i = 0; i < productIds.length; i += 1) {
            const product = await this.productRepository.findOne(productIds[i]);

            if (product) {
                productsOnSale.push(product);
            }
        }

        flashSale.products = productsOnSale;

        return this.repository.save(flashSale);
    }

    public async removeProductsFromFlashSale(flashSaleId: string, productIds: string[]): Promise<FlashSales> {
        const flashSale = await this.repository.findOneWithProduct(flashSaleId);

        if (!flashSale) {
            throw new ErrorObject(ErrorCodes.FLASH_SALE_NOT_FOUND_ERROR, 'Flash sale tidak ditemukan');
        }

        let productsOnSale = flashSale.products;

        for (let i = 0; i < productIds.length; i += 1) {
            productsOnSale = productsOnSale.filter((p) => {
                return p.id !== productIds[i];
            });
        }

        flashSale.products = productsOnSale;

        return this.repository.save(flashSale);
    }

    async isPromoDateCollide(start: string, end: string): Promise<boolean> {
        const collision = await this.repository.findCollision(start, end);

        return !!collision;
    }
}
