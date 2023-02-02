import { Branches } from 'src/models/branches';
import { Categories } from 'src/models/categories';
import { OutletAddresses } from 'src/models/Outlet-address';
import { Outlets } from 'src/models/Outlets';
import { Products } from 'src/models/products';
import { Users } from 'src/models/Users';
import { Payments } from 'src/models/Payments';
import { Shipments } from 'src/models/shipments';
import { Orders } from 'src/models/orders';
import { Carts } from 'src/models/carts';
import { BankAccounts } from 'src/models/bank-accounts';
import { ProductImages } from 'src/models/Product-Images';
import { Notifications } from 'src/models/Notifications';
import { Banners } from 'src/models/Banners';
import { ProductReviews } from 'src/models/Product-Reviews';
import { FlashSales } from 'src/models/flash-sales';
import { News } from 'src/models/news';
import { OutletTypes } from 'src/models/Outlet-types';
import { Promotions } from 'src/models/promotion';
import { PromotionsProducts } from 'src/models/promotion-product';
import { PaymentTerms } from 'src/models/payment-terms';
import { CartsBatch } from 'src/models/carts-batch';
import { Ppob } from 'src/models/ppobs';

export const entities = [
    Users,
    Outlets,
    OutletAddresses,
    Categories,
    Products,
    Branches,
    Payments,
    Shipments,
    Orders,
    Carts,
    BankAccounts,
    ProductImages,
    Notifications,
    Banners,
    ProductReviews,
    FlashSales,
    News,
    OutletTypes,
    Promotions,
    PromotionsProducts,
    PaymentTerms,
    CartsBatch,
    Ppob
];
