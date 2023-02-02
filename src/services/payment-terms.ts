/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPaymentTermsCreate, PaymentTermsRepository } from 'src/libs/database/repository/payment-terms';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { PaymentTerms } from 'src/models/payment-terms';

export interface PaymentTermsService {
    get(): Promise<PaymentTerms[]>;
    create(paymentTerm: IPaymentTermsCreate): Promise<PaymentTerms>;
    update(updateData: any): Promise<PaymentTerms>;
    filter(data: any): Promise<PaymentTerms[]>;
    getActive(): Promise<PaymentTerms[]>;
}

export class PaymentTermsService {
    private repository: PaymentTermsRepository;

    constructor(repository: PaymentTermsRepository) {
        this.repository = repository;
    }

    get(): Promise<PaymentTerms[]> {
        return this.repository.find();
    }

    filter(data: any): Promise<PaymentTerms[]> {
        let filterNameClause: string;
        let filterStatusClause: string;
        let limitClause: string;
        let offsetClause: string;

        if (data.name && !data.status) {
            filterNameClause = `WHERE payment_terms."name" ilike '%${data.name}%'`;
            filterStatusClause = ``;
        } else if (!data.name && data.status) {
            if (data.status === 'ACTIVE') {
                filterNameClause = ``;
                filterStatusClause = `WHERE payment_terms."status" LIKE 'ACTIVE'`;
            } else if (data.status === 'INACTIVE') {
                filterNameClause = ``;
                filterStatusClause = `WHERE payment_terms."status" LIKE 'INACTIVE'`;
            } else {
                filterNameClause = ``;
                filterStatusClause = `WHERE payment_terms."status" LIKE '%ACTIVE%'`;
            }
        } else if (data.name && data.status) {
            filterNameClause = `WHERE payment_terms."name" ilike '%${data.name}%'`;
            if (data.status === 'ACTIVE') {
                filterStatusClause = `AND payment_terms."status" LIKE 'ACTIVE'`;
            } else if (data.status === 'INACTIVE') {
                filterStatusClause = `AND payment_terms."status" LIKE 'INACTIVE'`;
            } else {
                filterStatusClause = `AND payment_terms."status" LIKE '%ACTIVE%'`;
            }
        } else {
            filterNameClause = ``;
            filterStatusClause = ``;
        }

        /* if (data.status) {
            if (data.status === 'ACTIVE') {
                filterStatusClause = `WHERE payment_terms."status" LIKE 'ACTIVE'`;
            } else if (data.status === 'INACTIVE') {
                filterStatusClause = `WHERE payment_terms."status" LIKE 'INACTIVE'`;
            } else {
                filterStatusClause = `WHERE payment_terms."status" LIKE '%ACTIVE%'`;
            }
        } */

        if (data.limit) {
            limitClause = `LIMIT ${data.limit}`;
            if (limitClause !== '') {
                if (data.page > 0) {
                    const offset = data.limit * (data.page - 1);
                    offsetClause = `OFFSET ${offset}`;
                } else {
                    limitClause = `LIMIT ${data.limit}`;
                    offsetClause = `OFFSET 0`;
                }
            } else {
                offsetClause = `OFFSET 0`;
            }
        } else {
            limitClause = `LIMIT 1000`;
            offsetClause = `OFFSET 0`;
        }

        const query = `SELECT * FROM "payment_terms" ${filterNameClause} ${filterStatusClause} ORDER BY "created" ASC ${limitClause} ${offsetClause}`;
        return this.repository.query(query);
    }

    getActive(): Promise<PaymentTerms[]> {
        const query = `SELECT * FROM "payment_terms" WHERE status = 'ACTIVE'`; // AND type = 'LOAN' OR type = 'CASH_ON_DELIVERY' OR type = 'DIRECT'
        return this.repository.query(query);
    }

    create(payment_term: IPaymentTermsCreate): Promise<PaymentTerms> {
        return this.repository.save(payment_term);
    }

    async update(updateData: any): Promise<PaymentTerms> {
        const paymentTermData = await this.repository.findOne(updateData.id);

        if (!paymentTermData) {
            throw new ErrorObject(ErrorCodes.PAYMENT_TERM_ERROR, 'Payment Term not found', null);
        }

        const newPaymentTerm = {
            id: paymentTermData,
            ...paymentTermData,
            ...updateData
        };

        return this.repository.save(newPaymentTerm);
    }
}
