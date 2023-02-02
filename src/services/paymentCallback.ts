import { Xendit } from 'src/clients/xendit/xendit';
import { EChannel, IPaymentResponse } from 'src/clients/xendit/xendit.interfaces';

export class PaymentCallbackService {
    private xendit: Xendit;

    constructor() {
        this.xendit = new Xendit(EChannel.VIRTUAL_ACCOUNT);
    }

    public async validate(paymentReponse: IPaymentResponse): Promise<IPaymentResponse> {
        const validation = await this.xendit.paymentDetail(paymentReponse.payment_id);

        return validation;
    }
}
