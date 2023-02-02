import Xendit from 'xendit-node';
import addDays from 'date-fns/addDays';
import { IPaymentOption, IPaymentResponse, IPayment, EBankCode } from '../xendit.interfaces';
import { vaConfig } from '../config/vaConfig';

export class VirtualAccount implements IPayment {
    private client: Xendit;

    private va;

    constructor(client: Xendit) {
        this.client = client;
        const { VirtualAcc } = this.client;
        this.va = new VirtualAcc({});
        return this;
    }

    async create(option: IPaymentOption): Promise<IPaymentResponse> {
        console.log('option:', option);
        const config = vaConfig[option.bank];

        if (!config) {
            throw new Error('Invalid Merchant code');
        }
        const request = {
            externalID: option.externalID, // Later bisa pake user uuid?
            bankCode: option.bank,
            name: option.billTo.replace(/[^a-zA-Z0-9 ]/g, ''),
            expectedAmt: option.amount,
            isSingleUse: true, // Cman sekali pake
            isClosed: true, // Harus ngisi exact sesuai dengan yang diminta
            expirationDate: option.expirationDate // dibikin sesuai order expiration time
        };

        // if (option.bank === EBankCode.MANDIRI || option.bank === EBankCode.BRI) {
        //     request.data.suggestedAmt = option.amount;
        // }

        console.log(request);

        return this.va
            .createFixedVA(request)
            .then((res) => {
                console.info('XDT response - create VA:', res);
                return res;
            })
            .catch((err) => {
                console.log(err);
                console.error('err', err);
                throw new Error(err);
            });
    }

    async find(id: string): Promise<IPaymentResponse> {
        return this.va
            .getFixedVA({ id })
            .then((res) => {
                console.log(res);
                return res;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(err);
            });
    }

    async update(id: string, amount?: number, expirationDate?: Date): Promise<IPaymentResponse> {
        const option: { [key: string]: string | number | Date } = {
            id
        };

        if (amount) {
            option.suggestedAmt = amount;
            option.expectedAmt = amount;
        }

        if (expirationDate) {
            option.expirationDate = expirationDate;
        }

        return this.va
            .updateFixedVA(option)
            .then((res) => {
                console.log('XDT response - update VA:', res);
                return res;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(err);
            });
    }

    async paymentDetail(paymentID: string): Promise<IPaymentResponse> {
        return this.va
            .getVAPayment({ paymentID })
            .then((res) => {
                console.log(res, 'payment detail');
                return res;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(err);
            });
    }
}
