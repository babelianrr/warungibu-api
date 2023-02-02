import { init1632290525869 } from './1632290525869-init';
import { AddProductImage1632292998918 } from './1632292998918-AddProductImage';
import { BankAccountInit1632312517078 } from './1632315764309-BankAccountInit';
import { CategoriesTestSeeder1632312787461 } from './1632312787461-CategoriesTestSeeder';
import { ProductTestSeeder1632312677092 } from './1632312677092-ProductTestSeeder';
import { updateNpwpOutletBecomeNull1632555999268 } from './1632555999268-updateNpwpOutletBecomeNull';
import { UpdatePaymentsTable1632412173325 } from './1632412173325-UpdatePaymentsTable';
import { UpdateOrdersTable1632474813602 } from './1632474813602-UpdateOrdersTable';
import { AlterPostalCodeType1632792075842 } from './1632792075842-AlterPostalCodeType';
import { AddVerificationEmailFlow1632869760375 } from './1632869760375-AddVerificationEmailFlow';
import { updateGenderBirthdateBecomeNull1632765333461 } from './1632765333461-updateGenderBirthdateBecomeNull';
import { addNotesOnOutletAddress1633177597655 } from './1633177597655-addNotesOnOutletAddress';
import { AddRefundAmountInPayment1633416629588 } from './1633416629588-AddRefundAmountInPayment';
// import { AddPaymentAccountBank1633773040053 } from './1633773040053-AddPaymentAccountBank';
import { PaymentUpdate1633773040055 } from './1633773040055-PaymentUpdate';
// import { PaymentMigrationData1633773040056 } from './1633773040056-PaymentMigrationData';
import { addHistoryOrder1633773040057 } from './1633773040057-addHistoryOrder';
import { orderStatusMigration1636612339710 } from './1636612339710-orderStatusMigration';
import { AddDpf1633773040061 } from './1633773040061-AddDpf';
import { CreateNotificationTable1634045712534 } from './1634045712534-CreateNotificationTable';
import { addIndexOrders1634287334128 } from './1634287334128-addIndexOrders';
import { addProductFavorites1634804932288 } from './1634804932288-addProductFavorites';
import { AddSapPriceProduct1634831256066 } from './1634831256066-AddSapPriceProduct';
import { AddCategoryCascade1634840975165 } from './1634840975165-AddCategoryCascade';
import { addCompletionDeadline1633773040058 } from './1633773040058-addCompletionDeadline';
import { AddBannerTable1635143860401 } from './1635143860401-AddBannerTable';
import { AddProductReviewTable1635349588834 } from './1635349588834-AddProductReviewTable';
import { addDiscountInCart1635238647836 } from './1635238647836-addDiscountInCart';
import { CreateFlashSale1635240584107 } from './1635240584107-CreateFlashSale';
import { UpdateFlashSale1635496223382 } from './1635496223382-UpdateFlashSale';
import { AddUserNoRef1636015781498 } from './1636015781498-AddUserNoRef';
import { AddLoanLevelOnUser1636258013758 } from './1636258013758-AddLoanLevelOnUser';
import { AddResetPasswordToken1636282736499 } from './1636282736499-AddResetPasswordToken';
import { AddProductDiscountEndDate1634804932280 } from './1634804932280-AddProductDiscountEndDate';
import { CreateNewsTable1636596367492 } from './1636596367492-CreateNewsTable';
import { CreateOutletType1636612339706 } from './1636612339706-CreateOutletType';
import { AllowNullOrderIdInNotification1636814318414 } from './1636814318414-AllowNullOrderIdInNotification';
import { AddNewsSlug1637244832837 } from './1637244832837-AddNewsSlug';
import { AddProductPriceInCart1636612339707 } from './1636612339707-AddProductPriceInCart';
import { AddNewPromotionTable1641268484474 } from "./1641268484474-AddNewPromotionTable";
import { AlterPromotionTable1642395446684 } from "src/libs/database/migrations/1642395446684-AlterPromotionTable";
import { AlterDiscountPercentage1646383022090 } from './1646383022090-AlterDiscountPercentage';

const testMigrations = [];

export const migrations: any = [
    init1632290525869,
    AddProductImage1632292998918,
    BankAccountInit1632312517078,
    updateNpwpOutletBecomeNull1632555999268,
    updateGenderBirthdateBecomeNull1632765333461,
    ...(process.env.NODE_ENV === 'local' ? testMigrations : []),
    UpdatePaymentsTable1632412173325,
    UpdateOrdersTable1632474813602,
    AlterPostalCodeType1632792075842,
    AddVerificationEmailFlow1632869760375,
    addNotesOnOutletAddress1633177597655,
    AddRefundAmountInPayment1633416629588,
    // AddPaymentAccountBank1633773040053,
    PaymentUpdate1633773040055,
    // PaymentMigrationData1633773040056,
    addHistoryOrder1633773040057,
    addCompletionDeadline1633773040058,
    AddDpf1633773040061,
    CreateNotificationTable1634045712534,
    addIndexOrders1634287334128,
    AddProductDiscountEndDate1634804932280,
    addProductFavorites1634804932288,
    AddSapPriceProduct1634831256066,
    AddCategoryCascade1634840975165,
    AddBannerTable1635143860401,
    AddProductReviewTable1635349588834,
    addDiscountInCart1635238647836,
    CreateFlashSale1635240584107,
    UpdateFlashSale1635496223382,
    AddUserNoRef1636015781498,
    AddLoanLevelOnUser1636258013758,
    AddResetPasswordToken1636282736499,
    CreateNewsTable1636596367492,
    CreateOutletType1636612339706,
    AddProductPriceInCart1636612339707,
    orderStatusMigration1636612339710,
    AllowNullOrderIdInNotification1636814318414,
    AddNewsSlug1637244832837,
    AddNewPromotionTable1641268484474,
    AlterPromotionTable1642395446684,
    AlterDiscountPercentage1646383022090
];
