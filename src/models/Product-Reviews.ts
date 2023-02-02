/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { Products } from './products';
import { Users } from './Users';

export interface IBranchCreateRequest {
    branch_code: string;
    location?: string;
    stock: number;
    product_sku: string;
}

@Entity({ name: 'product_reviews' })
export class ProductReviews {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    notes: string;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'varchar' })
    product_id: string;

    @Column({ type: 'varchar' })
    order_id: string;

    @ManyToOne(() => Products, (product) => product.reviews)
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Products;

    @Column({ type: 'varchar' })
    user_id: string;

    @ManyToOne(() => Users, (user) => user.reviews)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Users;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
