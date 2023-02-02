/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { EntityRepository, Repository } from 'typeorm';
import { PaymentTerms, PaymentTermStatus, PaymentTermType } from 'src/models/payment-terms';

export interface IPaymentTermsRepo {}

export interface IPaymentTermsCreate {
    type: PaymentTermType;
    name: string;
    days_due: string;
    status: PaymentTermStatus;
}

@EntityRepository(PaymentTerms)
export class PaymentTermsRepository extends Repository<PaymentTerms> {
    getPaymentTermsByType(type: string) {
        return this.createQueryBuilder('payment_terms').select().where('payment_terms.type = :type', { type }).getOne();
    }
}
