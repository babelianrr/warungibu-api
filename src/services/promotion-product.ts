/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PromotionsProducts } from 'src/models/promotion-product';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { Promotions } from 'src/models/promotion';
import { Products } from 'src/models/products';

interface IPromotionProductRepo {
    find(): Promise<PromotionsProducts[]>;
    findOne(id: string): Promise<PromotionsProducts>;
    create(promoData: any): PromotionsProducts;
    save(promoData: any): Promise<PromotionsProducts>;
    checkPromotionProductExist(
        productId: string,
        qty_min: number,
        qty_max: number,
        promotionProductId?: string
    ): Promise<PromotionsProducts[]>;
}

interface IPromotion {
    findOne(id: string): Promise<Promotions>;
}

interface IProduct {
    findOne(id: string): Promise<Products>;
}

export class PromotionProductService {
    private promotionProductsRepository: IPromotionProductRepo;

    private promotionRepository: IPromotion;

    private productRepository: IProduct;

    constructor(
        promotionProductsRepository: IPromotionProductRepo,
        promotionRepository: IPromotion,
        productRepository: IProduct
    ) {
        this.promotionProductsRepository = promotionProductsRepository;
        this.promotionRepository = promotionRepository;
        this.productRepository = productRepository;
    }

    public async findAll(): Promise<PromotionsProducts[]> {
        return this.promotionProductsRepository.find();
    }

    public async findById(id: string): Promise<PromotionsProducts> {
        const promotionProduct = await this.promotionProductsRepository.findOne(id);
        return promotionProduct;
    }

    public async add(promoData: any): Promise<PromotionsProducts> {
        const promotion = await this.promotionRepository.findOne(promoData.promotion_id);
        if (!promotion && promotion.type !== 'TIERED') {
            throw new ErrorObject(ErrorCodes.PROMOTION_NOT_FOUND_ERROR, 'Promo tidak ditemukan.');
        }
        const product = await this.productRepository.findOne(promoData.product_id);
        if (!product) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan.');
        }
        const exist = await this.promotionProductsRepository.checkPromotionProductExist(
            promoData.product_id,
            promoData.qty_min,
            promoData.qty_max
        );
        console.log(exist);
        if (exist.length > 0) {
            throw new ErrorObject(ErrorCodes.PROMOTION_PRODUCTS_EXIST, 'Promotion Produk Aktif telah terdaftar.');
        }

        const newData = {
            ...promoData,
            promotion,
            product
        };
        const promotionProduct = this.promotionProductsRepository.create(newData);

        return this.promotionProductsRepository.save(promotionProduct);
    }

    public async update(promoData: any): Promise<PromotionsProducts> {
        const promotionProduct = await this.promotionProductsRepository.findOne(promoData.id);
        if (!promotionProduct) {
            throw new ErrorObject(ErrorCodes.PROMOTION_NOT_FOUND_ERROR, 'Promo tidak ditemukan');
        }

        let product;
        if (promoData.product_id) {
            product = await this.productRepository.findOne(promoData.product_id);
            if (!product) {
                throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan.');
            }
        } else {
            product = promotionProduct.product;
        }

        const exist = await this.promotionProductsRepository.checkPromotionProductExist(
            product.id,
            promoData.qty_min,
            promoData.qty_max,
            promotionProduct.id
        );
        if (exist.length > 0) {
            throw new ErrorObject(ErrorCodes.PROMOTION_PRODUCTS_EXIST, 'Promotion Produk Aktif telah terdaftar.');
        }

        const updatePromotionProduct = {
            ...promotionProduct,
            ...promoData,
            product
        };

        return this.promotionProductsRepository.save(updatePromotionProduct);
    }

    public async delete(id: string) {
        const promotionProduct = await this.promotionProductsRepository.findOne(id);

        if (!promotionProduct) {
            throw new ErrorObject(ErrorCodes.PROMOTION_NOT_FOUND_ERROR, 'Promo tidak ditemukan');
        }

        promotionProduct.status = 'INACTIVE';

        return this.promotionProductsRepository.save(promotionProduct);
    }
}
