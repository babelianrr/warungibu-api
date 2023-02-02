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

export interface IBranchCreateRequest {
    branch_code: string;
    location?: string;
    stock: number;
    product_sku: string;
}

@Entity({ name: 'product_images' })
export class ProductImages {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    url: string;

    @Column({ type: 'varchar' })
    product_id: string;

    @ManyToOne(() => Products, (product) => product.images)
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Products;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
