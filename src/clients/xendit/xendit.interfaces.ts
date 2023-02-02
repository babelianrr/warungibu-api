export interface IPaymentOption {
    externalID: string;
    amount: number;
    type?: string;
    billTo: string;
    callbackURL?: string;
    phone?: string;
    bank?: string;
    expirationDate?: string;
}

export interface ICardPaymentChargeOption {
    externalID: string;
    tokenID: string;
    authID: string;
    amount: number;
    cardCVN: string;
    descriptor?: string;
    currency?: string;
    midLabel?: string;
    billingDetails?: any;
    promoCode?: string;
    bankCode?: string;
}

export interface IMerchantConfig {
    merchantCode: number;
    start: number;
    end: number;
}

export enum EChannel {
    VIRTUAL_ACCOUNT = 'VIRTUAL ACCOUNT',
    CARD_PAYMENT = 'CARD PAYMENT',
    LOAN = 'LOAN'
}

export enum EBankCode {
    BCA = 'BCA',
    BNI = 'BNI',
    BRI = 'BRI',
    BJB = 'BJB',
    CIMB = 'CIMB',
    MANDIRI = 'MANDIRI',
    PERMATA = 'PERMATA',
    SAHABAT_SAMPOERNA = 'SAHABAT_SAMPOERNA',
    LOAN = 'LOAN'
}

export interface IPayment {
    create: (option: IPaymentOption) => Promise<IPaymentResponse>;
    find: (id: string) => Promise<IPaymentResponse>;
    update: (id: string, amount?: number, expirationDate?: Date) => Promise<IPaymentResponse>;
    paymentDetail: (paymentId: string) => Promise<IPaymentResponse>;
}
export interface ICardPayment {
    createCharge: (option: ICardPaymentChargeOption) => Promise<ICardPaymentChargeResponse>;
    // find: (id: string) => Promise<IPaymentResponse>;
    // update: (id: string, amount?: number, expirationDate?: Date) => Promise<IPaymentResponse>;
    // paymentDetail: (paymentId: string) => Promise<IPaymentResponse>;
}

export interface IPaymentResponse {
    is_closed: boolean;
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
    currency: string;
    owner_id: string;
    external_id: string;
    bank_code: string;
    merchant_code: string;
    name: string;
    account_number: string;
    suggested_amount: string;
    expected_amount: string;
    expiration_date: string;
    is_single_use: boolean;
    id: string;
    payment_id: string;
    created?: string;
    updated?: string;
}

export interface ICardPaymentChargeResponse {
    merchant_reference_code: string;
    masked_card_number: string;
    card_type: string;
    is_closed: boolean;
    status: 'CAPTURED' | 'AUTHORIZED' | 'REVERSED' | 'FAILED';
    owner_id: string;
    external_id: string;
    bank_code: string;
    merchant_code: string;
    name: string;
    account_number: string;
    suggested_amount: string;
    expected_amount: string;
    expiration_date: string;
    is_single_use: boolean;
    id: string;
    payment_id: string;
    created?: string;
    updated?: string;
}

export interface IPaymentCallback {
    id: string;
    payment_id: string;
    callback_virtual_account_id: string;
    external_id: string;
    bank_code: string;
    merchant_code: string;
    account_number: string;
    amount: number;
    transaction_timestamp: string;
    sender_name: string;
    owner_id: string;
    created: string;
    updated: string;
}
