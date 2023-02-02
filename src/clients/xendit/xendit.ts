import '../../module-alias';
import { XENDIT_SECRET_KEY } from 'src/config';
import XenditClient from 'xendit-node';
import { EChannel, IPaymentOption, IPayment, IPaymentResponse } from './xendit.interfaces';
import { VirtualAccount } from './payments/virtualAccount';

export class Xendit {
    private client: XenditClient;

    private type: EChannel;

    private paymentInstance: IPayment;

    constructor(type: EChannel) {
        this.type = type;
        this.client = new XenditClient({
            secretKey: XENDIT_SECRET_KEY
        });

        if (type === EChannel.VIRTUAL_ACCOUNT) {
            this.paymentInstance = new VirtualAccount(this.client);
        }
    }

    async create(options: IPaymentOption): Promise<IPaymentResponse> {
        return this.paymentInstance.create(options);
    }

    async find(id: string): Promise<IPaymentResponse> {
        return this.paymentInstance.find(id);
    }

    async update(id: string, amount?: number, expirationDate?: Date): Promise<IPaymentResponse> {
        return this.paymentInstance.update(id, amount, expirationDate);
    }

    async paymentDetail(paymentID: string): Promise<IPaymentResponse> {
        return this.paymentInstance.paymentDetail(paymentID);
    }
}

// new Xendit(EChannel.VIRTUAL_ACCOUNT).create({
//     bank: EBankCode.MANDIRI,
//     externalID: '123-is-closed',
//     amount: 5000,
//     billTo: 'Semmi Verian Reusable'
// });

// new Xendit(EChannel.VIRTUAL_ACCOUNT).find('6148b2c813deaf190ad26ea2');
// new Xendit(EChannel.VIRTUAL_ACCOUNT).find('6148bbba13deaf5009d26ead');

// new Xendit(EChannel.VIRTUAL_ACCOUNT).update('6148bbba13deaf5009d26ead', 100000);
