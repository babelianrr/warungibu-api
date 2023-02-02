import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Users } from './Users';
import { Shipments } from './shipments';

export enum EAddressStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface IOutletAddressRequest {
    label: string;
    receiver_name: string;
    mobile_phone: string;
    province: string;
    city: string;
    full_address: string;
    district: string;
    subdistrict: string;
    user_id: string;
    status: EAddressStatus;
    postal_code?: number;
    notes?: string;
    is_main?: boolean;
}

@Entity({ name: 'outlet_addresses' })
export class OutletAddresses {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    label: string;

    @Column({ type: 'varchar' })
    receiver_name: string;

    @Column({ type: 'varchar' })
    mobile_phone: string;

    @Column({ type: 'varchar' })
    province: string;

    @Column({ type: 'varchar' })
    city: string;

    @Column({ type: 'varchar' })
    district: string;

    @Column({ type: 'varchar' })
    subdistrict: string;

    @Column({ type: 'int' })
    postal_code: number;

    @Column({ type: 'text' })
    full_address: string;

    @Column({ type: 'text' })
    notes: string;

    @Column({ type: 'varchar' })
    status: EAddressStatus;

    @ManyToOne(() => Users, (user) => user.outlet_addresses)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Users;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'boolean' })
    is_main: boolean;

    @Column({ type: 'varchar' })
    deleted_at: string;

    @OneToMany(() => Shipments, (shipment) => shipment.id)
    shipments: Shipments[];

    @CreateDateColumn({ type: 'timestamptz' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated: Date;
}
