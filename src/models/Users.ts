import { IsEmail } from 'class-validator';
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
    ManyToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { OutletAddresses } from './Outlet-address';
import { Outlets } from './Outlets';
import { Carts } from './carts';
import { Orders } from './orders';
import { BankAccounts } from './bank-accounts';
import { Products } from './products';
import { ProductReviews } from './Product-Reviews';
import { News } from './news';
import { OutletTypes } from './Outlet-types';

export enum EGender {
    FEMALE = 'FEMALE',
    MALE = 'MALE'
}

export enum ERoleStatus {
    ADMIN = 'ADMIN',
    INACTIVE_ADMIN = 'INACTIVE_ADMIN',
    BASIC_USER = 'BASIC_USER', // not authorized to buy
    AUTHORIZED_USER = 'AUTHORIZED_USER', // have customer_id
    AJP_USER = 'AJP_USER', // AJP
    UNVERIFIED_USER = 'UNVERIFIED_USER', // not verify email yet
    SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum ELoginProvider {
    GOOGLE = 'GOOGLE',
    MANUAL = 'MANUAL'
}

@Entity({ name: 'users' })
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    customer_id: string;

    @Column({ type: 'varchar' })
    @IsEmail()
    email: string;

    @Column({ type: 'varchar', nullable: true })
    ktp?: string;

    @Column({ type: 'varchar' })
    password: string;

    @Column({ type: 'varchar' })
    pin: string;

    @Column({ type: 'text' })
    user_address: string;

    @Column({ type: 'varchar' })
    gender: EGender;

    @Column({ type: 'varchar' })
    phone_number: string;

    @Column({ type: 'varchar' })
    client_phone: string;

    @Column({ type: 'varchar' })
    role_status: ERoleStatus;

    @Column({ type: 'varchar' })
    login_provider: ELoginProvider;

    @Column({ type: 'varchar' })
    photo_url?: string;

    @OneToOne(() => Outlets, (outlet) => outlet.user_id)
    outlets?: Outlets;

    @ManyToOne(() => OutletTypes, (outlet_types) => outlet_types.user_id, { nullable: true })
    @JoinColumn({ name: 'outlet_types_id', referencedColumnName: 'id' })
    outlet_types_id?: OutletTypes;

    @OneToMany(() => OutletAddresses, (address) => address.user, { nullable: true })
    outlet_addresses?: OutletAddresses[];

    @OneToMany(() => ProductReviews, (productReview) => productReview.user)
    reviews?: { type: ProductReviews; nullable: true };

    @OneToMany(() => News, (news) => news.user)
    news?: { type: News; nullable: true };

    @OneToMany(() => Carts, (cart) => cart.id)
    carts: Carts[];

    @OneToMany(() => Orders, (order) => order.id)
    orders: Orders[];

    @OneToMany(() => BankAccounts, (bank_account) => bank_account.id)
    bank_accounts: BankAccounts[];

    @Column({ type: 'varchar' })
    verification_token: string;

    @Column({ type: 'varchar' })
    noref_dplus: string;

    @Column({ type: 'integer' })
    loan_level?: number;

    @Column({ type: 'varchar' })
    npwp?: string;

    @Column({ type: 'integer' })
    loan_limit?: number;

    @ManyToMany(() => Products, (product) => product.fav_by)
    product_favorites?: Promise<Products[]>;

    @Column({ type: 'varchar' })
    reset_password_token?: string;

    @Column({ type: 'timestamptz' })
    reset_password_expired_at?: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated: Date;
}
