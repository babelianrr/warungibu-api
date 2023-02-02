/* eslint-disable import/no-cycle */
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Products } from './products';
import { Users } from './Users';

@Entity()
export class News {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar' })
    image: string;

    @Column({ type: 'varchar' })
    slug: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => Users, (user) => user.news, { eager: true })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: Users;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: string;
}
