/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
    OneToMany
} from 'typeorm';

import { Users } from './Users';
import { Orders } from './orders';
import { Products } from './products';
import { CartsBatch } from './carts-batch';

export interface ICartCreateRequest {
    product_id: string;
    location: string;
    quantity: number;
    user_id: string;
}

export interface IInvocieCartCreateRequest {
    product_id: string;
    location: string;
    quantity: number;
    user_id: string;
    transaction_number: string;
}

export interface ICartUpdateRequest {
    user_id: string;
    id: string;
    location: string;
    quantity: number;
}

export interface IInvoiceCartUpdateRequest {
    product_id: string;
    cart_id: string;
    location: string;
    quantity: number;
    // price: number;
    discount?: number;
    transaction_number: string;
}

export enum CartStatuses {
    ACTIVE = 'ACTIVE',
    DELETED = 'DELETED',
    ORDERED = 'ORDERED',
    FAILED = 'FAILED'
}

/* export enum CartBatchStatuses {
    ASSIGNED = 'ASSIGNED',
    PARTIALLY = 'PARTIALLY ASSIGNED',
    UNASSIGNED = 'UNASSIGNED'
} */

@Entity()
export class Carts {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'varchar' })
    location?: string;

    @Column({ type: 'int' })
    final_unit_price: number;

    @Column({ type: 'int' })
    unit_price: number;

    @Column({ type: 'varchar', enum: CartStatuses })
    status: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid' })
    order_id: string;

    @Column({ type: 'int' })
    discount_percentage?: number;

    @ManyToOne(() => Products, (product) => product.carts)
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Products;

    @ManyToOne(() => Users, (user) => user.carts)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Users;

    @ManyToOne(() => Orders, (order) => order.carts)
    @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
    order?: Orders;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;

    updated_price?: number;

    @OneToMany(() => CartsBatch, (batch) => batch.carts)
    batch: CartsBatch[];
}
