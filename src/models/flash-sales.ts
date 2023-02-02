/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    JoinTable,
    ManyToMany
} from 'typeorm';
import { Products } from './products';

export interface IFlashSaleCreateRequest {
    id?: string;
    start_date: string;
    end_date: string;
    notes: string;
}

export enum FlashSaleStatuses {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

@Entity()
export class FlashSales {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    notes: string;

    @Column({ type: 'varchar' })
    status: FlashSaleStatuses;

    @Column({ type: 'timestamptz' })
    start_date: string;

    @Column({ type: 'timestamptz' })
    end_date: string;

    @ManyToMany(() => Products, (product) => product.flash_sale, { eager: true, cascade: true })
    @JoinTable({
        name: 'product_flash_sales',
        joinColumn: {
            name: 'flash_sale_id'
        },
        inverseJoinColumn: {
            name: 'product_id'
        }
    })
    products?: Products[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
