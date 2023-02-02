import { EBankCode, IMerchantConfig } from '../xendit.interfaces';

export const vaConfig: { [key: string]: IMerchantConfig } = {
    [EBankCode.BCA]: {
        merchantCode: 10766,
        start: 9999000001,
        end: 9999999999
    },
    [EBankCode.BRI]: {
        merchantCode: 26215,
        start: 5243000000,
        end: 5243999999
    },
    [EBankCode.BNI]: {
        merchantCode: 8808,
        start: 524300000000,
        end: 524319999999
    },
    [EBankCode.PERMATA]: {
        merchantCode: 8214,
        start: 524300000000,
        end: 524319999999
    },
    [EBankCode.MANDIRI]: {
        merchantCode: 88608,
        start: 5243000000,
        end: 5243999999
    }
};
