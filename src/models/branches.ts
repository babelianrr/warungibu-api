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

@Entity()
export class Branches {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    branch_code: string;

    @Column({ type: 'varchar' })
    location?: string;

    @Column({ type: 'int' })
    stock: number;

    @ManyToOne(() => Products, (product) => product.branches)
    @JoinColumn({ name: 'product_sku', referencedColumnName: 'sku_number' })
    product: Products;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
