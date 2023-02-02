/* eslint-disable import/no-cycle */
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, OneToMany } from 'typeorm';
import { PromotionsProducts } from './promotion-product';

export enum PromotionStatuses {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum PromotionTypes {
    TIERED = 'TIERED',
    CODE = 'CODE'
}

export interface IPromotionCreateRequest {
    name: string;
    code?: string;
    start_date: string;
    end_date: string;
    status?: string;
    max_usage_promo?: number;
    max_usage_user?: number;
    type: string;
}

export interface IPromotionUpdateRequest {
    id: string;
    name: string;
    code?: string;
    start_date: string;
    end_date: string;
    status?: string;
    max_usage_promo?: number;
    max_usage_user?: number;
    type: string;
}

@Entity()
export class Promotions {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    code?: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'date' })
    start_date: string;

    @Column({ type: 'date' })
    end_date: string;

    @Column({ type: 'varchar', enum: PromotionStatuses })
    status: string;

    @Column({ type: 'text', enum: PromotionTypes })
    type: string;

    @Column({ type: 'int' })
    min_purchase: number;

    @Column({ type: 'int' })
    max_usage_promo: number;

    @Column({ type: 'int' })
    max_usage_user: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    discount_percentage: number;

    @Column({ type: 'int' })
    max_discount_amount: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;

    @OneToMany(() => PromotionsProducts, (promotionProducts) => promotionProducts.promotion, {
        eager: true,
        cascade: true
    })
    promotion_products: PromotionsProducts[];
}
