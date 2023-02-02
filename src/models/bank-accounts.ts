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

import { Users } from './Users';

export enum BankAccountStatuses {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface IBankAccountCreateRequest {
    bank_name: string;
    account_number: string;
    account_name: string;
    branch_name: string;
    user_id: string;
}

export interface IBankAccountUpdateRequest {
    id: string;
    user_id: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    branch_name?: string;
    status?: string;
}

@Entity()
export class BankAccounts {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    bank_name: string;

    @Column({ type: 'varchar' })
    account_number: string;

    @Column({ type: 'varchar' })
    account_name: string;

    @Column({ type: 'varchar' })
    branch_name: string;

    @Column({ type: 'varchar', enum: BankAccountStatuses })
    status: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => Users, (user) => user.bank_accounts)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Users;

    @Column({ type: 'timestamptz' })
    deleted_at: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
