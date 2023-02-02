/* eslint-disable import/no-cycle */
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, ManyToMany } from 'typeorm';

import { Products } from './products';

@Entity()
export class Categories {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    icon_url: string;

    @ManyToMany(() => Products, (products) => products.categories)
    products: Products[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
