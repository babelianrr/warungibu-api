/* eslint-disable @typescript-eslint/ban-types */
import { EChannel } from 'src/clients/xendit/xendit.interfaces';
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn } from 'typeorm';

export const TAX_PERCENTAGE = 11;
export const ORDER_DISCOUNT_PERCENTAGE = 0.9;
export const VA_FEE = 4000;

export enum EPaymentMethod {
    XENDIT_VA = 'XENDIT_VA',
    BANK_TRANSFER = 'BANK_TRANSFER',
    XENDIT_CC = 'XENDIT_CC',
    XENDIT_DC = 'XENDIT_DC',
    LOAN = 'LOAN'
}

export enum EPaymentType {
    LOAN = 'LOAN'
}

export enum EPaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    NEED_REFUND = 'NEED_REFUND',
    REFUNDED = 'REFUNDED'
}

export enum EPaymentEventType {
    CREATED = 'CREATED',
    PAID = 'PAID',
    CREATE_VA = 'CREATE_VA',
    UPDATED = 'UPDATED',
    EXPIRED = 'EXPIRED',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED'
}

export interface IBuildPaymentData {
    payment_type?: string;
    payment_method?: EPaymentMethod;
    payment_channel?: EChannel;
    account_number?: string;
    account_name?: string;
    account_bank?: string;
}

export interface IPaymentAmount {
    product_price: number;
    shipment_fee: number;
    tax: number;
    order_discount: number;
    unique_amount: number;
    channel_fee: number;
    total_amount: number;
}

export interface IPaymentData {
    type: string;
    method?: EPaymentMethod;
    channel?: EChannel;
    product_price: number;
    shipment_fee: number;
    tax: number;
    order_discount: number;
    unique_amount: number;
    channel_fee: number;
    total_amount: number;
    account_bank?: string;
    reference_number?: string;
    account_name?: string;
    account_number?: string;
    status: EPaymentStatus;
    events?: IPaymentEvents[];
}

export interface IPaymentEvents {
    type: 'PAYMENT';
    total_amount: number;
    status: EPaymentStatus;
    method?: EPaymentMethod;
    channel: EChannel;
    account_number?: string;
    reference_number?: string;
    event_type: EPaymentEventType;
    timestamp: string;
}

@Entity({ name: 'payments' })
export class Payments {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'varchar', enum: EPaymentMethod })
    method?: EPaymentMethod;

    @Column({ type: 'varchar', enum: EChannel })
    channel?: EChannel;

    @Column({ type: 'int' })
    product_price: number;

    @Column({ type: 'int' })
    shipment_fee: number;

    @Column({ type: 'int' })
    tax: number;

    @Column({ type: 'int' })
    order_discount: number;

    @Column({ type: 'int' })
    unique_amount: number;

    @Column({ type: 'int' })
    channel_fee: number;

    @Column({ type: 'int' })
    total_amount: number;

    @Column({ type: 'int' })
    refund_amount?: number;

    @Column({ type: 'varchar' })
    reference_number?: string;

    @Column({ type: 'varchar' })
    payment_reference_number?: string;

    @Column({ type: 'varchar' })
    account_name?: string;

    @Column({ type: 'varchar' })
    account_number?: string;

    @Column({ type: 'varchar' })
    account_bank?: string;

    @Column({ type: 'varchar' })
    status: EPaymentStatus;

    @Column({ type: 'jsonb', nullable: true })
    events?: IPaymentEvents[];

    @CreateDateColumn({ type: 'timestamptz' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated: Date;

    @Column({ type: 'int' })
    promotion_discount?: number;

    @Column({ type: 'varchar' })
    promotion_code?: string;

    @Column({ type: 'timestamptz' })
    payment_date?: string;

    @Column({ type: 'varchar' })
    invoice_no?: string;

    @Column({ type: 'timestamptz' })
    invoice_date?: string;

    @Column({ type: 'int' })
    days_due?: number;
}
