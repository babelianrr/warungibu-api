/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne
} from 'typeorm';
import { Products } from './products';
import { Promotions } from './promotion';

export enum PromotionProductStatuses {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface IPromotionCreateRequest {
    promotion_id: string;
    product_id: string;
    percentage: number;
    qty_min: number;
    qty_max: number;
    status?: string;
}

export interface IPromotionUpdateRequest {
    id: string;
    promotion_id: string;
    product_id: string;
    percentage: number;
    qty_min: number;
    qty_max: number;
    status?: string;
}

@Entity()
export class PromotionsProducts {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Promotions, (promotion) => promotion.promotion_products)
    @JoinColumn({ name: 'promotion_id', referencedColumnName: 'id' })
    promotion: Promotions;

    @ManyToOne(() => Products, (product) => product.promotions, { nullable: false, eager: true })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Products;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    percentage: number;

    @Column({ type: 'int' })
    qty_min: number;

    @Column({ type: 'int' })
    qty_max: number;

    @Column({ type: 'varchar', enum: PromotionProductStatuses })
    status: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
