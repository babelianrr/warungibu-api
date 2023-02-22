/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { EChannel } from 'src/clients/xendit/xendit.interfaces';
import { Users } from './Users';
import { EPaymentMethod, Payments } from './Payments';
import { Shipments } from './shipments';
import { Carts } from './carts';

export enum OrderStatuses {
    ORDERED = 'ORDERED',
    PROCESSED = 'PROCESSED',
    ONGOING = 'ONGOING',
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
}

export interface IOrderCreateRequest {
    shipment?: {
        address_id?: string;
        location?: string;
    };
    payment: {
        total_price: number;
        payment_type?: string;
        payment_method?: EPaymentMethod;
        account_name?: string;
        account_number?: string;
        payment_channel?: EChannel;
    };
    carts?: string[]; // any
    user_id: string;
    ref_id?: string;
}

export interface IPpobCreateRequest {
    shipment: {
        address_id?: string;
        location?: string;
    };
    payment: {
        total_price: number;
        payment_type?: string;
        payment_method?: EPaymentMethod;
        account_name?: string;
        account_number?: string;
        account_bank?: string;
        payment_channel?: EChannel;
        reference_number?: string;
        payment_reference_number?: string;
    };
    user_id: string;
    ref_id: string;
    carts?: string[];
    sn?: string;
    status?: string;
}

export interface IOrderUpdateRequest {
    id: string;
    user_id: string;
    payment: {
        total_price: number;
        payment_method: EPaymentMethod;
        payment_channel: EChannel;
        account_name: string;
        account_number: string;
        account_bank: string;
    };
}

export interface IOrderEvents {
    type: string;
    status: OrderStatuses;
    timestamp: string;
    email: string;
    transaction_number?: string;
    serial_number?: string;
}

@Entity()
export class Orders {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    transaction_number?: string;

    @Column({ type: 'varchar', enum: OrderStatuses })
    status: OrderStatuses;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'jsonb' })
    order_events: IOrderEvents[];

    @ManyToOne(() => Users, (user) => user.orders)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Users;

    @OneToOne(() => Payments, { cascade: true })
    @JoinColumn({ name: 'payment_id', referencedColumnName: 'id' })
    payment?: Payments;

    @OneToOne(() => Shipments, { cascade: true })
    @JoinColumn({ name: 'shipment_id', referencedColumnName: 'id' })
    shipment?: Shipments;

    @OneToMany(() => Carts, (cart) => cart.order, { eager: true })
    carts: Carts[];

    @Column({ type: 'timestamptz' })
    expired_at: string;

    @Column({ type: 'timestamptz' })
    completion_deadline: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
