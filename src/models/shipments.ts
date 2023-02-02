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

import { OutletAddresses } from './Outlet-address';
import { OutletTypes } from './Outlet-types';

@Entity()
export class Shipments {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    courier: string;

    @Column({ type: 'varchar' })
    track_number: string;

    @Column({ type: 'timestamptz' })
    delivery_date?: string;

    @Column({ type: 'timestamptz' })
    receive_date?: string;

    @Column({ type: 'varchar' })
    receiver_name?: string;

    @Column({ type: 'varchar' })
    location: string;

    @Column({ type: 'int' })
    price: number;

    @Column({ type: 'uuid' })
    outlet_address_id?: string;

    @ManyToOne(() => OutletAddresses)
    @JoinColumn({ name: 'outlet_address_id', referencedColumnName: 'id' })
    address: OutletAddresses;

    @ManyToOne(() => OutletTypes)
    @JoinColumn({ name: 'outlet_types_id', referencedColumnName: 'id' })
    outlet_types_id: OutletTypes;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
