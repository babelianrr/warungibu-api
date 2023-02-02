import Xendit from 'xendit-node';
import { ICardPaymentChargeResponse, ICardPaymentChargeOption, ICardPayment } from '../xendit.interfaces';
import { vaConfig } from '../config/vaConfig';

export class CardPayment implements ICardPayment {
    private client: Xendit;

    private card;

    constructor(client: Xendit) {
        this.client = client;
        const { Card } = this.client;
        this.card = new Card({});
        return this;
    }

    async createCharge(option: ICardPaymentChargeOption): Promise<ICardPaymentChargeResponse> {
        console.log('option:', option);

        return this.card
            .createCharge(option)
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

    // async find(id: string): Promise<IPaymentResponse> {
    //     return this.va
    //         .getFixedVA({ id })
    //         .then((res) => {
    //             console.log(res);
    //             return res;
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             throw new Error(err);
    //         });
    // }
    //
    // async update(id: string, amount?: number, expirationDate?: Date): Promise<IPaymentResponse> {
    //     const option: { [key: string]: string | number | Date } = {
    //         id
    //     };
    //
    //     if (amount) {
    //         option.suggestedAmt = amount;
    //         option.expectedAmt = amount;
    //     }
    //
    //     if (expirationDate) {
    //         option.expirationDate = expirationDate;
    //     }
    //
    //     return this.va
    //         .updateFixedVA(option)
    //         .then((res) => {
    //             console.log('XDT response - update VA:', res);
    //             return res;
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             throw new Error(err);
    //         });
    // }
    //
    // async paymentDetail(paymentID: string): Promise<IPaymentResponse> {
    //     return this.va
    //         .getVAPayment({ paymentID })
    //         .then((res) => {
    //             console.log(res, 'payment detail');
    //             return res;
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //             throw new Error(err);
    //         });
    // }
}
