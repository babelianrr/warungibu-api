/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
    OneToMany
} from 'typeorm';
import { Users } from './Users';

@Entity()
export class OutletTypes {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    npwp: string;

    @Column({ type: 'varchar' })
    phone: string;

    @Column({ type: 'integer' })
    loan_limit: number;

    @Column({ type: 'text' })
    address: string;

    @OneToMany(() => Users, (user) => user.outlet_types_id, { nullable: true })
    user_id: Users[];

    @Column({ type: 'bool', default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
