import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    JoinColumn,
    OneToOne
} from 'typeorm';
import { Users } from './Users';

@Entity({ name: 'outlets' })
export class Outlets {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'varchar' })
    npwp?: string;

    @Column({ type: 'varchar' })
    telephone: string;

    @Column({ type: 'varchar' })
    mobile_phone: string;

    @OneToOne(() => Users)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user_id: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated: Date;
}
