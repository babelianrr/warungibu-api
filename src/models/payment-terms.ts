import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn } from 'typeorm';

export enum PaymentTermType {
    DIRECT = 'DIRECT',
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
    LOAN = 'LOAN'
}

export enum PaymentTermStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

@Entity()
export class PaymentTerms {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', enum: PaymentTermType })
    type: PaymentTermType;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    days_due: string;

    @Column({ type: 'varchar', enum: PaymentTermStatus })
    status: PaymentTermStatus;

    @CreateDateColumn({ type: 'timestamptz' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated: Date;
}
