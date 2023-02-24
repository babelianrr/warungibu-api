/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    OneToOne
} from 'typeorm';

import { PromotionsProducts } from './promotion-product';
import { FlashSales } from './flash-sales';
import { Categories } from './categories';
import { Branches } from './branches';
import { Carts } from './carts';
import { ProductImages } from './Product-Images';
import { Users } from './Users';
import { ProductReviews } from './Product-Reviews';

export enum ProductStatuses {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum DiscountTypes {
    PRICE = 'PRICE',
    PERCENTAGE = 'PERCENTAGE'
}

export enum EProductTypes {
    GENERAL = 'GENERAL',
    PPOB = 'PPOB'
}

export interface IProductCreateRequest {
    name: string;
    picture_url?: string;
    sku_number: string;
    company_name: string;
    description?: string;
    unit: string;
    price: number;
    valid_to: string;
    categories?: string[];
    branches: any[];
    product_type?: EProductTypes;
    status?: string;
}

export interface IProductUpdateRequest {
    id: string;
    name?: string;
    sku_number?: string;
    company_name?: string;
    description?: string;
    unit?: string;
    discount_percentage?: number;
    discount_price?: number;
    valid_to?: string;
    status?: string;
    categories?: string[];
    discount_type?: string;
    branches?: any[];
    dpf?: string;
    price?: number;
}

@Entity()
export class Products {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    picture_url?: string;

    @Column({ type: 'varchar' })
    sku_number: string;

    @Column({ type: 'varchar' })
    company_name: string;

    @Column({ type: 'text' })
    description?: string;

    @Column({ type: 'varchar' })
    unit: string;

    @Column({ type: 'varchar' })
    slug: string;

    @Column({ type: 'int' })
    price: number;

    @Column({ type: 'int' })
    sap_price: number;

    @Column({ type: 'int' })
    discount_price?: number;

    @Column({ type: 'int' })
    discount_percentage?: number;

    @Column({ type: 'varchar', enum: DiscountTypes })
    discount_type?: string;

    @Column({ type: 'varchar', enum: ProductStatuses })
    status: string;

    @Column({ type: 'varchar' })
    dpf?: string;

    is_flash_sale?: boolean;

    stock?: number;

    sold?: number;

    is_favorite?: boolean;

    average_rating?: number;

    total_rating?: number;

    @ManyToMany(() => Categories, (categories) => categories.products, { eager: true, cascade: true })
    @JoinTable({
        name: 'products_categories',
        joinColumn: {
            name: 'product_id'
        },
        inverseJoinColumn: {
            name: 'category_id'
        }
    })
    categories?: Categories[];

    @OneToMany(() => Branches, (branches) => branches.product, { eager: true, cascade: true })
    branches: Branches[];

    @OneToMany(() => ProductImages, (productImages) => productImages.product, { eager: true, cascade: true })
    images: ProductImages[];

    @OneToMany(() => ProductReviews, (productReview) => productReview.product)
    reviews: ProductImages[];

    @OneToMany(() => Carts, (cart) => cart.product)
    carts: Carts[];

    @ManyToMany(() => Users, (users) => users.product_favorites, { eager: false, cascade: true })
    @JoinTable({
        name: 'product_favorites',
        joinColumn: {
            name: 'product_id'
        },
        inverseJoinColumn: {
            name: 'user_id'
        }
    })
    fav_by: Promise<Users[]>; // use lazy, if not find() will always return this by default

    @ManyToMany(() => FlashSales, (flashSales) => flashSales.products)
    flash_sale: FlashSales[];

    @Column({ type: 'timestamptz' })
    valid_to: string;

    @Column({ type: 'varchar' })
    product_type: EProductTypes;

    @Column({ type: 'timestamptz' })
    discount_end_date: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;

    @OneToMany(() => PromotionsProducts, (promotionsProduct) => promotionsProduct.product)
    promotions: PromotionsProducts[];

    promotion_headers: any[];
}
