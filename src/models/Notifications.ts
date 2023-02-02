import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    JoinColumn,
    OneToOne
} from 'typeorm';
import { Orders } from './orders';
import { Users } from './Users';

export enum NotificationMessage {
    CREATED = 'Pesananan anda berhasil dibuat',
    CONFIRM_PAYMENT = 'Pembayaran anda sukses dikonfirmasi',
    CANCELED = 'Pesanan anda dibatalkan',
    DELIVERED = 'Pesanan anda telah sampai',
    ONGOING = 'Pesanan anda sedang dalam perjalanan',
    SUCCESS = 'Pesanan anda telah selesai',
    CUSTOMER_ID_UPDATED = 'Customer ID anda diubah'
}

@Entity()
export class Notifications {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    message: string;

    @Column({ type: 'boolean' })
    seen: boolean;

    @OneToOne(() => Users)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Users;

    @OneToOne(() => Orders)
    @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
    order?: Orders;

    @Column({ type: 'uuid', select: false })
    user_id: string;

    @Column({ type: 'uuid', select: false })
    order_id?: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
