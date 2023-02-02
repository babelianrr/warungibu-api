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
import { Carts } from './carts';

@Entity()
export class CartsBatch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Carts, (carts) => carts.batch)
    @JoinColumn({ name: 'carts_id', referencedColumnName: 'id' })
    carts: Carts;

    @Column({ type: 'uuid' })
    carts_id: string;

    @Column({ type: 'varchar' })
    batch_no: string;

    @Column({ type: 'varchar' })
    exp_date: string;

    @Column({ type: 'int4' })
    quantity: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated: Date;
}
