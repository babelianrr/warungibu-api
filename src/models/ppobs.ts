import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ppob' })
export class Ppob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    product_name: string;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'varchar' })
    brand: string;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'varchar' })
    seller_name: string;

    @Column({ type: 'integer' })
    price: number;

    @Column({ type: 'integer' })
    sell_price: number;

    @Column({ type: 'varchar' })
    buyer_sku_code: string;

    @Column({ type: 'boolean' })
    buyer_product_status: boolean;

    @Column({ type: 'boolean' })
    seller_product_status: boolean;

    @Column({ type: 'boolean' })
    unlimited_stock: boolean;

    @Column({ type: 'integer' })
    stock: number;

    @Column({ type: 'boolean' })
    multi: boolean;

    @Column({ type: 'varchar' })
    start_cut_off: string;

    @Column({ type: 'varchar' })
    end_cut_off: string;

    @Column({ type: 'text' })
    desc: string;

    @Column({ type: 'boolean' })
    active: boolean;
}
