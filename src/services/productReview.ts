/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductReviews } from 'src/models/Product-Reviews';
import { ProductReviewRepository } from 'src/libs/database/repository/product_review';

export interface IProductReviewService {
    findForProduct(productId: string, query: any): Promise<ProductReviews[]>;
    countAll(productId: string): Promise<any>;
    create(review: any): Promise<ProductReviews>;
    // create(image: string): Promise<Banners>;
    delete(id: string): Promise<any>;
}

export class ProductReviewService implements IProductReviewService {
    private productReviewRepository: ProductReviewRepository;

    constructor(productReviewRepository: ProductReviewRepository) {
        this.productReviewRepository = productReviewRepository;
    }

    public async findForProduct(productId: string, query: any): Promise<ProductReviews[]> {
        return this.productReviewRepository.findForProduct(productId, query);
    }

    public async countAll(productId: string): Promise<any> {
        return this.productReviewRepository.countAll(productId);
    }

    public async create(review: any): Promise<ProductReviews> {
        return this.productReviewRepository.save(review);
    }

    public async delete(id: string): Promise<any> {
        return this.productReviewRepository.delete(id);
    }
}
