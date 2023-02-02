/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Promotions } from 'src/models/promotion';
import { PromotionsProducts } from 'src/models/promotion-product';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { CartStatuses } from 'src/models/carts';
import { Orders } from 'src/models/orders';

export interface IPromotionRepo {
    find(): Promise<Promotions[]>;
    findAllSorted(): Promise<Promotions[]>;
    findOne(id: string): Promise<Promotions>;
    findByCode(code: string): Promise<Promotions>;
    create(promoData: any): Promotions;
    save(promoData: any): Promise<Promotions>;
    findWithFilter(queryString: any): Promise<Promotions[]>;
    findPromotionCode(queryString: any, userId: string): Promise<Promotions[]>;
    countAll(isAdmin: boolean, query?: any): Promise<any>;
}

interface IOrderRepo {
    findOrderById(id: string): Promise<Orders>;
}

export class PromotionService {
    private promotionRepository: IPromotionRepo;

    private orderRepository: IOrderRepo;

    constructor(promotionRepository: IPromotionRepo, orderRepository: IOrderRepo) {
        this.promotionRepository = promotionRepository;
        this.orderRepository = orderRepository;
    }

    public async findWithFilter(queryString: any): Promise<Promotions[]> {
        await this.updateInactive();
        return this.promotionRepository.findWithFilter(queryString);
    }

    public async findByCode(code: string): Promise<Promotions> {
        return this.promotionRepository.findByCode(code);
    }

    public async findById(id: string): Promise<Promotions> {
        return this.promotionRepository.findOne(id);
    }

    public async countAll(isAdmin: boolean, query?: any): Promise<any> {
        return this.promotionRepository.countAll(isAdmin, query);
    }

    public async add(promoData: any): Promise<Promotions> {
        if (promoData.type === 'CODE') {
            const checkPromotion = await this.promotionRepository.findByCode(promoData.code);

            if (checkPromotion) {
                throw new ErrorObject(ErrorCodes.PROMOTION_CODE_EXIST, 'Promotion code telah terdaftar');
            }
        }

        const promotion = this.promotionRepository.create({
            code: promoData.code,
            name: promoData.name,
            start_date: promoData.start_date,
            end_date: promoData.end_date,
            type: promoData.type,
            max_usage_promo: promoData.max_usage_promo,
            max_usage_user: promoData.max_usage_user,
            min_purchase: promoData.min_purchase,
            discount_percentage: promoData.discount_percentage,
            max_discount_amount: promoData.max_discount_amount,
            status: promoData.status
        });

        return this.promotionRepository.save(promotion);
    }

    public async update(promoData: any): Promise<Promotions> {
        const promotion = await this.promotionRepository.findOne(promoData.id);

        if (!promotion) {
            throw new ErrorObject(ErrorCodes.CATEGORY_NOT_FOUND_ERROR, 'Promo tidak ditemukan');
        }

        const updatePromotion = {
            ...promotion,
            ...promoData
        };
        console.log(updatePromotion);

        return this.promotionRepository.save(updatePromotion);
    }

    public async delete(id: string) {
        const promotion = await this.promotionRepository.findOne(id);

        if (!promotion) {
            throw new ErrorObject(ErrorCodes.CATEGORY_NOT_FOUND_ERROR, 'Promo tidak ditemukan');
        }
        promotion.status = 'INACTIVE';

        return this.promotionRepository.save(promotion);
    }

    public async findPromotionCode(queryString: any, userId: string): Promise<Promotions[]> {
        const query = {
            bank_code: '',
            total_amount: 0
        };
        const bankList = [
            {
                bankCode: 'BRI',
                bankName: 'PT. Bank Rakyat Indonesia (Persero)'
            },
            {
                bankCode: 'BCA',
                bankName: ''
            },
            {
                bankCode: 'BNI',
                bankName: 'PT. Bank Rakyat Indonesia (Persero)'
            }
        ];

        if (queryString.order_id) {
            const order = await this.orderRepository.findOrderById(queryString.order_id);
            query.total_amount = order.payment.total_amount;
        }

        if (queryString.bank !== undefined) {
            const bank = bankList.filter((b) => {
                return b.bankName === queryString.bank;
            });
            query.bank_code = bank.length > 0 ? bank[0].bankCode : '';
            if (query.bank_code === 'BRI') {
                return this.promotionRepository.findPromotionCode(query, userId);
            }
        }

        return [];
    }

    private async updateInactive() {
        const activePromotions = await this.promotionRepository.findWithFilter({ status: 'ACTIVE' });
        console.log(activePromotions);

        activePromotions.forEach((promotion) => {
            const currDate = new Date().toISOString().slice(0, 10);
            if (currDate > promotion.end_date) {
                // eslint-disable-next-line no-param-reassign
                promotion.status = 'INACTIVE';
                this.promotionRepository.save(promotion);
            }
        });
    }
}
