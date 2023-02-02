/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CartBatchRepository, ICartBatchCreate } from 'src/libs/database/repository/carts-batch';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { CartsBatch } from 'src/models/carts-batch';
import { DeleteResult } from 'typeorm';

export interface ICartBatchService {
    create(createBatch: ICartBatchCreate): Promise<CartsBatch>;
    get(): Promise<CartsBatch[]>;
    getByCartId(id: string): Promise<CartsBatch[]>;
    update(updateData: any): Promise<CartsBatch>;
    delete(id: string): Promise<DeleteResult>;
}

export class CartBatchService {
    private repository: CartBatchRepository;

    constructor(repository: CartBatchRepository) {
        this.repository = repository;
    }

    create(createBatch: ICartBatchCreate): Promise<CartsBatch> {
        return this.repository.save(createBatch);
    }

    get(): Promise<CartsBatch[]> {
        return this.repository.find();
    }

    getByCartId(id: any): Promise<CartsBatch[]> {
        return this.repository.find({
            where: {
                carts_id: id
            }
        });
    }

    async update(updateData: any): Promise<CartsBatch> {
        const batch = await this.repository.findOne(updateData.id);

        if (!batch) {
            throw new ErrorObject(ErrorCodes.BATCH_NOT_FOUND_ERROR, 'Batch number not found', null);
        }

        const newBatch = {
            id: batch,
            ...batch,
            ...updateData
        };

        return this.repository.save(newBatch);
    }

    async delete(id: string): Promise<DeleteResult> {
        const batch = await this.repository.findOne({ id });

        if (!batch) {
            throw new ErrorObject(ErrorCodes.BATCH_NOT_FOUND_ERROR, 'Batch number not found', null);
        }

        return this.repository.delete({ id });
    }
}
