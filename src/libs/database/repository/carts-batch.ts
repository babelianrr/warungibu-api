import { EntityRepository, Repository } from 'typeorm';
import { CartsBatch } from 'src/models/carts-batch';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICartBatchRepo {}

export interface ICartBatchCreate {
    carts_id: string;
    batch_no: string;
    exp_date: string;
    quantity: number;
}

@EntityRepository(CartsBatch)
export class CartBatchRepository extends Repository<CartsBatch> {}
