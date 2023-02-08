/* eslint-disable no-unneeded-ternary */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-throw-literal */
import { addDays, format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import pdf from 'pdf-creator-node';
import fs from 'fs';
import path from 'path';

import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { DNR } from 'src/clients/dnr/dnr';
import { Xendit } from 'src/clients/xendit/xendit';
import { EChannel, ICardPaymentChargeOption, IPaymentCallback } from 'src/clients/xendit/xendit.interfaces';
import {
    IOrderCreateRequest,
    IOrderEvents,
    IOrderUpdateRequest,
    IPpobCreateRequest,
    Orders,
    OrderStatuses
} from 'src/models/orders';
import {
    EPaymentEventType,
    EPaymentMethod,
    EPaymentStatus,
    EPaymentType,
    IBuildPaymentData,
    IPaymentAmount,
    IPaymentData,
    Payments,
    TAX_PERCENTAGE
} from 'src/models/Payments';
import { Carts, CartStatuses, IInvocieCartCreateRequest, IInvoiceCartUpdateRequest } from 'src/models/carts';
import { Shipments } from 'src/models/shipments';
import { OutletAddresses } from 'src/models/Outlet-address';

import { IUserRepo } from 'src/libs/database/repository/user';
import { ICartRepo } from 'src/services/cart';
import { IOutletAddressRepo } from 'src/libs/database/repository/outlet_address';
import { MAX_CART_QUANTITY } from 'src/config';
import { IProductRepo } from 'src/services/product';
import { XenditCard } from 'src/clients/xendit/xenditCard';
import { Promotions } from 'src/models/promotion';
import { IQueryPromotionCode } from 'src/libs/database/repository/promotion';
import { EProductTypes, ProductStatuses } from 'src/models/products';
import { ERoleStatus } from 'src/models/Users';
import { Branches } from 'src/models/branches';
import { BranchRepository } from 'src/libs/database/repository/branch';
import { generateTransactionNumber } from 'src/libs/helpers/generate-trx-number';

export interface IOrderService {
    findForUser(userId: string): Promise<Orders[]>;
    findForAdmin(query: any, excel?: boolean): Promise<Orders[]>;
    findByIdForUser(userId?: string, id?: string): Promise<Orders>;
    createOrder(orderData: IOrderCreateRequest): Promise<Orders>;
    createPpobOrder(orderData: IPpobCreateRequest): Promise<Orders>;
    updatePayment(order: IOrderUpdateRequest): Promise<Orders>;
    completePaymentByAdmin(orderId: string): Promise<Orders>;
    completePaymentWithVA(callbackData: IPaymentCallback): Promise<Orders>;
    cancelOrderAdmin(transaction_number: string): Promise<Orders>;
    cancelOrderUser(orderId: string, userId: string, email: string): Promise<Orders>;
    deliveredOrderByAdmin(orderId: string, paid?: string, receiverName?: string): Promise<Orders>;
    confirmDeliveryByAdmin(updateData: any): Promise<Payments>;
    ongoingOrderByAdmin(id: string, faktur: string): Promise<Orders>;
    completeOrder(userId: string, id: string, email: string): Promise<Orders>;
    expireOrder(order: Orders): Promise<Orders>;
    getNumberOfProductSold(productId: string): Promise<number>;
    refundPayment(transaction_number: string): Promise<Orders>;
    getByTransactionNumber(transaction_number: string): Promise<any>;
    findByTransactionNumber(transaction_number: string): Promise<Orders>;
    countAll(): Promise<any>;
    countFiltered(query: any): Promise<any>;
    generateInvoice(transaction_number: string, invoice_type: string): any;
    generateFaktur(transaction_number: string, fakturType: string): any;
    chargeCardPayment(
        userId: string,
        id: string,
        chargeData: {
            externalID: any;
            tokenID: any;
            authID: any;
            amount: any;
            cardCVN: any;
            currency: string;
            midLabel: string;
            promoCode: any;
        }
    ): Promise<any>;
    addToCartInvoice(cartData: IInvocieCartCreateRequest): Promise<Carts>;
    updateInvoiceCart(cartData: IInvoiceCartUpdateRequest): Promise<Carts>;
    softDeleteInvoice(tansactionId: string, id: string): Promise<Carts>;
    getOrderByUserId(userId: string): any;
    generateFakturPpob(transaction_number: string, fakturType: string, inquiry?: any, downloadPdf?: boolean): any;
}
export interface IBranchController {
    getStockBySku(product_sku: any): Promise<Branches>;
}
interface IOrderRepo {
    find(): Promise<Orders[]>;
    findOne(id: string): Promise<Orders>;
    findForUser(userId: string): Promise<Orders[]>;
    findByIdForUser(userId: string, id: string): Promise<Orders>;
    create(orderData: any): Orders;
    save(order: Orders): Promise<Orders>;
    findOrderById(id: string): Promise<Orders>;
    findCompletedOrderByUserId(id: string): Promise<Orders[]>;
    findOrderByTransactionNumber(transaction_number: string): Promise<Orders>;
    getFakturByTransactionNumber(transaction_number: string): Promise<Orders>;
    findOrderToExpire(currentTime: string): Promise<Orders[]>;
    findForAdmin(query: any, exportExcel?: boolean): Promise<Orders[]>;
    countAll(): Promise<any>;
    countFiltered(query: any): Promise<any>;
    findOrderToComplete(currentTime: string): Promise<Orders[]>;
    findOrderByUserId(userId: string): Promise<Orders[]>;
}

interface IPaymentRepo {
    findOne(id: string): Promise<Payments>;
    create(paymentData: any): Payments;
    save(payment: Payments): Promise<Payments>;
}

interface IPaymentTermsRepo {
    getPaymentTermsByType(type: string): Promise<any>;
}

interface IShipmentRepo {
    create(shipmentData: any): Shipments;
}

interface IPromotionRepo {
    findPromotionCode(query: IQueryPromotionCode, userId: string): Promise<Promotions[]>;
}

export class OrderService implements IOrderService {
    private branchController: IBranchController;

    private repository: IOrderRepo;

    private userRepository: IUserRepo;

    private addressRepository: IOutletAddressRepo;

    private shipmentRepository: IShipmentRepo;

    private paymentRepository: IPaymentRepo;

    private paymentTermsRepo: IPaymentTermsRepo;

    private cartRepository: ICartRepo;

    private productRepository: IProductRepo;

    private promotionRepository: IPromotionRepo;

    private dnrClient: DNR;

    private xenditClient: Xendit;

    private xenditCardClient: XenditCard;

    private branchRepository: BranchRepository;

    constructor(
        repository: IOrderRepo,
        ur: IUserRepo,
        ar: IOutletAddressRepo,
        sr: IShipmentRepo,
        pr: IPaymentRepo,
        cr: ICartRepo,
        productRepository: IProductRepo,
        promotionRepository: IPromotionRepo,
        branchRepository: BranchRepository,
        paymentTermsRepository: IPaymentTermsRepo
    ) {
        this.repository = repository;
        this.userRepository = ur;
        this.addressRepository = ar;
        this.shipmentRepository = sr;
        this.paymentRepository = pr;
        this.cartRepository = cr;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
        this.dnrClient = new DNR();
        this.xenditClient = new Xendit(EChannel.VIRTUAL_ACCOUNT);
        this.xenditCardClient = new XenditCard(EChannel.CARD_PAYMENT);
        this.branchRepository = branchRepository;
        this.paymentTermsRepo = paymentTermsRepository;
    }

    public async findForUser(userId: string): Promise<Orders[]> {
        return this.repository.findForUser(userId);
    }

    public async findForAdmin(query: any, exportExcel?: boolean): Promise<Orders[]> {
        const orders = await this.repository.findForAdmin(query, exportExcel);
        for (let i = 0; i < orders.length; i += 1) {
            for (let c = 0; c < orders[i].carts.length; c += 1) {
                // eslint-disable-next-line no-await-in-loop
                const promotions = await this.productRepository.findPromotionForProductById(
                    orders[i].carts[c].product.id
                );
                orders[i].carts[c].product.promotions = promotions;
            }
        }
        return orders;
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    public async findByIdForUser(userId?: string, id?: string): Promise<Orders> {
        const order = await this.repository.findByIdForUser(userId, id);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        return order;
    }

    public async getByTransactionNumber(transactionNumber: string): Promise<any> {
        const order = await this.repository.getFakturByTransactionNumber(transactionNumber);
        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }
        const paymentTerms = await this.paymentTermsRepo.getPaymentTermsByType(order.payment.type);
        const result = { ...order, payment_term: paymentTerms.name };
        console.log('dapat gak?', result);
        return result;
    }

    public async findByTransactionNumber(transactionNumber: string): Promise<Orders> {
        const order = await this.repository.findOrderByTransactionNumber(transactionNumber);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        return order;
    }

    public async createOrder(orderData: IOrderCreateRequest): Promise<any> {
        if (orderData.carts.length === 0) {
            throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, 'Pesanan harus punya minimal 1 produk');
        }

        const user = await this.userRepository.findOne(orderData.user_id);

        if (!user) {
            throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, 'Akun tidak ditemukan');
        }

        const carts = [];
        let productPrice = 0;

        for (let i = 0; i < orderData.carts.length; i += 1) {
            const cartId = orderData.carts[i]; // .id
            const cart = await this.cartRepository.findOneForUser(user.id, cartId);

            if (!cart) {
                throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, `Keranjang tidak ditemukan`);
            }

            const productSku = cart.product.sku_number;
            const { quantity } = cart;

            let inBranch = await this.branchRepository.findStockByProductSku(productSku);
            if (!inBranch) {
                throw new ErrorObject(
                    ErrorCodes.PRODUCT_NOT_IN_STOCK,
                    `data tidak tersedia untuk produk ${cart.product.name}`
                );
            }

            if (Number(inBranch.stock) < quantity) {
                throw new ErrorObject(
                    ErrorCodes.CREATE_ORDER_ERROR,
                    `Stok untuk produk ${cart.product.name} tidak mencukupi`
                );
            }

            const promoValue = await this.tieredPromotionFinalUnitPrice(cart.product, cart.quantity);

            cart.final_unit_price = cart.quantity * (cart.product.price - cart.product.price * (promoValue / 100));
            cart.unit_price = cart.product.price;
            cart.discount_percentage = promoValue;

            productPrice += cart.final_unit_price;
            carts.push(cart);

            await this.branchRepository.updateStockSubs(inBranch, cart.product.sku_number, cart.quantity);
        }

        // deduct loan limit
        const userLoanLimit = user.loan_limit;

        if (productPrice > userLoanLimit) {
            throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, `Limit kredit tidak mencukupi.`);
        }

        await this.userRepository.changeLoanLimit(orderData.user_id, userLoanLimit - productPrice);

        // create order
        const expirationdate = addDays(new Date(), 30);

        // generate transaction number
        const existingOrder = await this.repository.countAll();

        const nextOrder = parseInt(existingOrder.totalOrder, 10) + 1;

        const newOrderData = {
            user_id: orderData.user_id,
            transaction_number: generateTransactionNumber(nextOrder),
            status: OrderStatuses.ORDERED,
            expired_at: expirationdate
        };

        let newOrder = this.repository.create(newOrderData);

        // create payment
        const paymentAmount = this.calculatePayment(
            orderData.payment.payment_method,
            orderData.payment.payment_type,
            productPrice
        );

        const paymentData = this.buildPaymentData(paymentAmount, orderData.payment, EPaymentEventType.CREATED);
        const payment = this.paymentRepository.create(paymentData);

        // create shipment
        const shipment = this.shipmentRepository.create({
            outlet_types_id: user.outlet_types_id,
            courier: 'Default',
            location: orderData.shipment.location,
            price: 0,
            track_number: 'Default'
        });

        newOrder.shipment = shipment;
        newOrder.payment = payment;

        newOrder = await this.repository.save(newOrder);

        newOrder.status = OrderStatuses.ORDERED;
        newOrder.order_events = this.addOrderEvents(newOrder, user.email);
        await this.repository.save(newOrder);

        newOrder.status = OrderStatuses.PROCESSED;
        user.email = 'ADMIN';

        carts.forEach(async (cart) => {
            cart.status = CartStatuses.ORDERED;
            cart.order_id = newOrder.id;
            cart.order = newOrder;

            await this.cartRepository.save(cart);
        });

        newOrder.order_events = this.addOrderEvents(newOrder, user.email);

        return this.repository.save(newOrder);
    }

    public async createPpobOrder(orderData: IPpobCreateRequest): Promise<any> {
        const user = await this.userRepository.findOne(orderData.user_id);

        if (!user) {
            throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, 'Akun tidak ditemukan');
        }

        const carts = [];
        let productPrice = 0;

        for (let i = 0; i < orderData.carts.length; i += 1) {
            const cartId = orderData.carts[i]; // .id
            const cart = await this.cartRepository.findOneForUser(user.id, cartId);

            if (!cart) {
                throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, `Keranjang tidak ditemukan`);
            }

            const productSku = cart.product.sku_number;

            let inBranch = await this.branchRepository.findStockByProductSku(productSku);
            if (!inBranch) {
                throw new ErrorObject(
                    ErrorCodes.PRODUCT_NOT_IN_STOCK,
                    `data tidak tersedia untuk produk ${cart.product.name}`
                );
            }

            cart.final_unit_price = cart.quantity * cart.product.price;
            cart.unit_price = cart.product.price;
            cart.discount_percentage = 0;

            productPrice += cart.final_unit_price;
            carts.push(cart);
        }

        // deduct loan limit
        const userLoanLimit = user.loan_limit;

        if (productPrice > userLoanLimit) {
            throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, 'Limit kredit tidak mencukupi.');
        }

        await this.userRepository.changeLoanLimit(orderData.user_id, userLoanLimit - productPrice);

        // create order
        const expirationdate = addDays(new Date(), 30);

        let newOrder = this.repository.create({
            user_id: orderData.user_id,
            transaction_number: orderData.ref_id,
            status: OrderStatuses.COMPLETED,
            expired_at: expirationdate
        });

        // create payment
        const paymentAmount = this.calculatePayment(
            orderData.payment.payment_method,
            orderData.payment.payment_type,
            productPrice
        );

        const paymentData = this.buildPaymentData(paymentAmount, orderData.payment, EPaymentEventType.PAID);
        const payment = this.paymentRepository.create(paymentData);
        const shipment = this.shipmentRepository.create({
            outlet_types_id: user.outlet_types_id,
            courier: 'Default',
            location: orderData.shipment.location,
            price: 0,
            track_number: 'Default'
        });

        newOrder.shipment = shipment;
        newOrder.payment = payment;
        newOrder = await this.repository.save(newOrder);
        await this.repository.save(newOrder);

        carts.forEach(async (cart) => {
            cart.status = CartStatuses.ORDERED;
            cart.order_id = newOrder.id;
            cart.order = newOrder;

            await this.cartRepository.save(cart);
        });

        newOrder.order_events = this.addOrderEvents(newOrder, user.email, orderData.sn);

        return this.repository.save(newOrder);
    }

    public async updatePayment(orderData: IOrderUpdateRequest): Promise<Orders> {
        const order = await this.repository.findByIdForUser(orderData.user_id, orderData.id);
        const user = await this.userRepository.findOneWithOutlets({
            where: { id: orderData.user_id },
            relations: ['outlets']
        });

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        if (order.payment.status === EPaymentStatus.SUCCESS) {
            throw new ErrorObject(ErrorCodes.UPDATE_ORDER_ERROR, 'Tidak dapat mengubah transaksi yang sudah diproses');
        }

        const existingPayment = order.payment;
        if (existingPayment.type === EPaymentType.LOAN) {
            throw new ErrorObject(ErrorCodes.UPDATE_ORDER_ERROR, 'Transaksi COD tidak dapat diubah');
        }

        const productPrice = existingPayment.product_price;
        const paymentType = existingPayment.type;

        const updatedAmount = this.calculatePayment(
            orderData.payment.payment_method,
            paymentType,
            productPrice,
            existingPayment.unique_amount
        );

        const expectedTotalAmount =
            updatedAmount.total_amount - updatedAmount.channel_fee - updatedAmount.unique_amount;

        if (expectedTotalAmount !== orderData.payment.total_price) {
            console.log({
                expected_total_amount: expectedTotalAmount,
                total_price: orderData.payment.total_price
            });
            throw new ErrorObject(ErrorCodes.UPDATE_ORDER_ERROR, `Jumlah pembayaran tidak sesuai`);
        }

        const updatedPaymentInfo = {
            payment_type: paymentType,
            ...orderData.payment
        };

        const newPaymentData = this.buildPaymentData(updatedAmount, updatedPaymentInfo, EPaymentEventType.UPDATED);

        const updatedPayment = {
            ...existingPayment,
            ...newPaymentData
        };

        updatedPayment.events = existingPayment.events?.concat(newPaymentData.events);
        order.payment = updatedPayment;

        order.order_events = this.addOrderEvents(order, user.email);

        return this.repository.save(order);
    }

    public async completePaymentByAdmin(transactionNumber: string): Promise<Orders> {
        const order = await this.repository.findOrderByTransactionNumber(transactionNumber);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        if (order.status !== OrderStatuses.ORDERED) {
            // mostly for loans. user paid after order being proccess.
            if (order.payment.type === EPaymentType.LOAN && order.payment.status === EPaymentStatus.PENDING) {
                return this.completePaymentAfterCompleteOrder(order);
            }

            throw new ErrorObject(
                ErrorCodes.COMPLETE_PAYMENT_ORDER_ERROR,
                'Status transaksi tidak sedang menunggu pembayaran'
            );
        }

        return this.completePayment(order);
    }

    public async completePaymentWithVA(callbackData: IPaymentCallback): Promise<Orders> {
        const order = await this.repository.findOrderByTransactionNumber(callbackData.external_id);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        if (order.status !== OrderStatuses.ORDERED) {
            // mostly for loans. user paid after order being proccess.
            if (order.payment.type === EPaymentType.LOAN && order.payment.status === EPaymentStatus.PENDING) {
                return this.completePaymentAfterCompleteOrder(order);
            }

            throw new ErrorObject(
                ErrorCodes.COMPLETE_PAYMENT_ORDER_ERROR,
                'Status transaksi tidak sedang menunggu pembayaran'
            );
        }

        if (order.payment.method !== EPaymentMethod.XENDIT_VA) {
            throw new ErrorObject(
                ErrorCodes.COMPLETE_PAYMENT_ORDER_ERROR,
                'Aksi hanya berlaku untuk order dengan virtual account'
            );
        }

        if (order.payment.reference_number !== callbackData.callback_virtual_account_id) {
            throw new ErrorObject(ErrorCodes.COMPLETE_PAYMENT_ORDER_ERROR, 'Pembayaran virtual account tidak sesuai');
        }

        return this.completePayment(order, callbackData.id);
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    public async chargeCardPayment(userId: string, id: string, chargeData: ICardPaymentChargeOption): Promise<any> {
        const order = await this.repository.findByIdForUser(userId, id);
        const address = await this.addressRepository.findOutletAddressByUserId(userId);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        if (order.status !== OrderStatuses.COMPLETED) {
            throw new ErrorObject(
                ErrorCodes.COMPLETE_PAYMENT_ORDER_ERROR,
                'Status transaksi tidak sedang menunggu pembayaran'
            );
        }
        let discountAmount = 0;
        let promotionCode = '';

        if (chargeData.promoCode) {
            const promotions = await this.promotionRepository.findPromotionCode(
                {
                    code: chargeData.promoCode,
                    bank_code: chargeData.bankCode,
                    total_amount: order.payment.total_amount
                },
                userId
            );

            if (promotions.length > 0) {
                const promotion = promotions[0];
                promotionCode = promotion.code;
                discountAmount = Math.ceil((Number(promotion.discount_percentage) / 100) * order.payment.total_amount);

                if (discountAmount >= promotion.max_discount_amount) {
                    discountAmount = promotion.max_discount_amount;
                }
            }
        }

        const paymentAmount = order.payment.total_amount - discountAmount;

        const requestCharge = {
            amount: paymentAmount,
            externalID: order.transaction_number,
            tokenID: chargeData.tokenID,
            authID: chargeData.authID,
            cardCVN: chargeData.cardCVN,
            descriptor: chargeData.descriptor,
            // currency: chargeData.currency,
            // midLabel: chargeData.midLabel,
            billingDetails: chargeData.billingDetails
        };

        console.log(requestCharge);

        // Xendit Charge Card Payment
        const charge = await this.xenditCardClient.create(requestCharge);

        if (charge) {
            if (charge.status === 'CAPTURED' || charge.status === 'AUTHORIZED') {
                if (order.payment.type === EPaymentType.LOAN && order.payment.status === EPaymentStatus.PENDING) {
                    if (charge.card_type === 'CREDIT') {
                        order.payment.method = EPaymentMethod.XENDIT_CC;
                    }
                    if (charge.card_type === 'DEBIT') {
                        order.payment.method = EPaymentMethod.XENDIT_DC;
                    }
                    order.payment.account_name = charge.masked_card_number;
                    order.payment.promotion_discount = discountAmount;
                    order.payment.promotion_code = promotionCode;
                    order.payment.reference_number = charge.merchant_reference_code;
                    order.payment.payment_date = charge.created;

                    await this.completeCardPayment(order);
                }
                return { message: 'success', orderId: order.id };
            }
        }

        throw new ErrorObject(ErrorCodes.COMPLETE_PAYMENT_ORDER_ERROR, 'Pembayaran Kartu Belum berhasil');
    }

    public async cancelOrderAdmin(transactionNumber: string): Promise<Orders> {
        const order = await this.repository.findOrderByTransactionNumber(transactionNumber);
        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        const user = await this.userRepository.findOne(order.user_id);
        if (!user) {
            throw new ErrorObject(ErrorCodes.CREATE_ORDER_ERROR, 'Akun tidak ditemukan');
        }

        if (order.status === OrderStatuses.DELIVERED || order.status === OrderStatuses.COMPLETED) {
            throw new ErrorObject(
                ErrorCodes.CANCEL_ORDER_ERROR,
                'Tidak dapat membatalkan transaksi yang sudah Terkirim atau Selesai'
            );
        }

        let productPrice = 0;
        // eslint-disable-next-line no-restricted-syntax
        for (const v of order.carts) {
            const branch = await this.branchRepository.findStockByProductSku(v.product.sku_number);
            await this.branchRepository.updateStockRevert(v.product.sku_number, v.quantity, branch);

            productPrice += v.final_unit_price;
        }

        const userLoanLimit = user.loan_limit;
        const userLoanLevel = user.loan_level;
        if (userLoanLevel !== 0) {
            await this.userRepository.changeLoanLimit(order.user_id, userLoanLimit + productPrice);
        }

        if (order.payment.status === EPaymentStatus.SUCCESS || order.payment.status === EPaymentStatus.PENDING) {
            order.payment.status = EPaymentStatus.REFUNDED;
            order.payment.events.push({
                type: 'PAYMENT',
                total_amount: order.payment.total_amount,
                status: EPaymentStatus.REFUNDED,
                method: order.payment.method,
                channel: order.payment.channel,
                account_number: order.payment.account_number,
                event_type: EPaymentEventType.REFUNDED,
                timestamp: new Date().toISOString()
            });
        }

        return this.cancelOrder(order, 'ADMIN');
    }

    public async cancelOrderUser(orderId: string, userId: string, email: string): Promise<Orders> {
        const order = await this.repository.findByIdForUser(userId, orderId);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        if (order.status !== OrderStatuses.ORDERED) {
            throw new ErrorObject(
                ErrorCodes.CANCEL_ORDER_ERROR,
                'Tidak dapat membatalkan transaksi yang sudah diproses'
            );
        }

        order.payment.status = EPaymentStatus.FAILED;
        order.payment.events.push({
            type: 'PAYMENT',
            total_amount: order.payment.total_amount,
            status: EPaymentStatus.FAILED,
            method: order.payment.method,
            channel: order.payment.channel,
            account_number: order.payment.account_number,
            event_type: EPaymentEventType.FAILED,
            timestamp: new Date().toISOString()
        });

        return this.cancelOrder(order, email);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public async confirmDeliveryByAdmin(updateData: any): Promise<Payments> {
        const payment = await this.paymentRepository.findOne(updateData.id);

        if (!payment) {
            throw new ErrorObject(ErrorCodes.PAYMENT_NOT_FOUND_ERROR, 'Payment data not found', null);
        }

        const newPaymentData = {
            id: payment,
            ...payment,
            ...updateData
        };

        return this.paymentRepository.save(newPaymentData);
    }

    public async ongoingOrderByAdmin(transactionNumber: string, faktur: string): Promise<Orders> {
        console.log({
            transaction_number: transactionNumber,
            faktur,
            action: `ORDER ${OrderStatuses.ONGOING}`,
            date: new Date()
        });

        const order = await this.repository.findOrderByTransactionNumber(transactionNumber);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Order tidak ditemukan');
        }

        if (order.status !== OrderStatuses.PROCESSED) {
            throw new ErrorObject(ErrorCodes.UPDATE_ORDER_ERROR, 'Order Belum Diproses atau Sudah terkirim');
        }

        const payment = await this.paymentRepository.findOne(order.payment.id);

        if (!payment) {
            throw new ErrorObject(ErrorCodes.PAYMENT_NOT_FOUND_ERROR, 'Payment data not found', null);
        }
        return this.updateOngoingOrder(order, faktur);
    }

    async updateOngoingOrder(order: Orders, faktur?: string): Promise<Orders> {
        order.status = OrderStatuses.ONGOING;
        order.payment.invoice_no = faktur;

        if (faktur && order.shipment) {
            order.shipment.track_number = faktur;
        }

        const updatedOrder: any = {
            ...order,
            status: OrderStatuses.ONGOING,
            payment: { ...order.payment, invoice_no: faktur, invoice_date: new Date().toISOString() }
        };
        updatedOrder.order_events = this.addOrderEvents(updatedOrder, 'ADMIN');

        return this.repository.save(updatedOrder);
    }

    public async deliveredOrderByAdmin(
        transactionNumber: string,
        paid?: string,
        receiverName?: string
    ): Promise<Orders> {
        console.log({
            transaction_number: transactionNumber,
            paid,
            receiverName,
            action: `ORDER: ${OrderStatuses.DELIVERED}`,
            date: new Date()
        });
        const order = await this.repository.findOrderByTransactionNumber(transactionNumber);
        const paidStatus = !!(paid && String(paid).toLowerCase() === 'true');
        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Order Tidak Ditemukan');
        }

        if (order.status !== OrderStatuses.ONGOING) {
            throw new ErrorObject(ErrorCodes.UPDATE_ORDER_ERROR, `Order belum dikirimkan atau sudah selesai.`, {
                order
            });
        }

        return this.updateDeliveredOrder(order, paidStatus, {
            receiver_name: receiverName
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    public async completeOrder(userId: string, id: string, email: string): Promise<Orders> {
        const order = await this.repository.findByIdForUser(userId, id);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'order not found');
        }

        if (order.status !== OrderStatuses.DELIVERED) {
            throw new ErrorObject(ErrorCodes.COMPLETE_ORDER_ERROR, 'Order Belum Terkirim atau Sudah Selesai');
        }

        const updatedOrder = {
            ...order,
            status: OrderStatuses.COMPLETED
        };

        updatedOrder.order_events = this.addOrderEvents(updatedOrder, email);
        return this.repository.save(updatedOrder);
    }

    public async expireOrder(order: Orders): Promise<Orders> {
        let { payment } = order;
        const { carts } = order;

        if (payment.type === EPaymentType.LOAN) {
            throw new ErrorObject(
                ErrorCodes.EXPIRE_ORDER_ERROR,
                'Expire order tidak berlaku untuk tipe pembayaran ini'
            );
        }

        switch (payment.type) {
            // case EPaymentType.DIRECT: {
            //     for (let i = 0; i < carts.length; i += 1) {
            //         carts[i].status = CartStatuses.FAILED;
            //         await this.cartRepository.save(carts[i]);
            //     }

            //     payment.status = EPaymentStatus.FAILED;
            //     payment.events.push({
            //         type: 'PAYMENT',
            //         total_amount: payment.total_amount,
            //         status: payment.status,
            //         method: payment.method,
            //         channel: payment.channel,
            //         account_number: payment.account_number,
            //         event_type: EPaymentEventType.EXPIRED,
            //         timestamp: new Date().toISOString()
            //     });

            //     order.status = OrderStatuses.CANCELED;
            //     break;
            // }
            case EPaymentType.LOAN: {
                payment.method = null;
                payment.channel = null;
                payment.account_number = null;
                payment.reference_number = null;

                const resetPaymentAmount = this.calculatePayment(payment.method, payment.type, payment.product_price);

                payment = {
                    ...payment,
                    ...resetPaymentAmount
                };

                payment.events.push({
                    type: 'PAYMENT',
                    total_amount: payment.total_amount,
                    status: payment.status,
                    method: payment.method,
                    channel: payment.channel,
                    account_number: payment.account_number,
                    event_type: EPaymentEventType.EXPIRED,
                    timestamp: new Date().toISOString()
                });
                break;
            }
            default:
        }

        order.payment = payment;
        order.order_events = this.addOrderEvents(order, 'ADMIN');

        return this.repository.save(order);
    }

    public async refundPayment(transactionNumber: string): Promise<Orders> {
        const order = await this.repository.findOrderByTransactionNumber(transactionNumber);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Transaksi tidak ditemukan');
        }

        if (order.payment.status !== EPaymentStatus.NEED_REFUND) {
            throw new ErrorObject(ErrorCodes.REFUND_ORDER_ERROR, 'Transaksi tidak sedang memerlukan refund');
        }

        order.payment.status = EPaymentStatus.REFUNDED;
        order.payment.events.push({
            type: 'PAYMENT',
            total_amount: order.payment.total_amount,
            status: order.payment.status,
            method: order.payment.method,
            channel: order.payment.channel,
            account_number: order.payment.account_number,
            event_type: EPaymentEventType.REFUNDED,
            timestamp: new Date().toISOString()
        });

        return this.repository.save(order);
    }

    public async getNumberOfProductSold(productId: string): Promise<number> {
        let total = 0;

        const carts = await this.cartRepository.findAllCompleteCartsByProduct(productId);

        for (let i = 0; i < carts.length; i += 1) {
            const cart = carts[i];

            const order = await this.repository.findOne(cart.order_id);

            if (order.status === OrderStatuses.DELIVERED || order.status === OrderStatuses.COMPLETED) {
                total += cart.quantity;
            }
        }

        return total;
    }

    isAddresJabodetabek(address: OutletAddresses): boolean {
        const city = address.city.toLowerCase();
        const jabodetabekCity = [
            'jakarta utara',
            'jakarta selatan',
            'jakarta timur',
            'jakarta barat',
            'jakarta pusat',
            'bogor',
            'depok',
            'tangerang',
            'tangerang selatan',
            'bekasi',
            'kepulauan seribu'
        ];

        return jabodetabekCity.includes(city);
    }

    calculatePayment(
        paymentMethod?: string,
        paymentType?: string,
        productPrice?: number,
        uniqueAmount: number = undefined
    ): any {
        const shipmentFee = 0; // TODO: get from SAP
        const tax = 0; // Math.ceil((TAX_PERCENTAGE / 100) * productPrice);
        const orderDiscount = 0;
        uniqueAmount = 0;
        // if (paymentMethod === EPaymentMethod.BANK_TRANSFER) {
        //     // Prevent to generate a new unique amount when updating order.
        //     uniqueAmount = uniqueAmount || Math.floor(100 + Math.random() * 900);
        // } else {
        //     uniqueAmount = 0;
        // }

        const channelFee = 0; // paymentMethod === EPaymentMethod.XENDIT_VA ? VA_FEE : 0;
        const totalAmount = productPrice;

        return {
            product_price: productPrice,
            shipment_fee: shipmentFee,
            tax,
            order_discount: orderDiscount,
            unique_amount: uniqueAmount,
            channel_fee: channelFee,
            total_amount: totalAmount
        };
    }

    buildPaymentData(
        paymentAmount: IPaymentAmount,
        paymentInfo: IBuildPaymentData,
        event: EPaymentEventType
    ): IPaymentData {
        const paymentData: IPaymentData = {
            ...paymentAmount,
            type: paymentInfo.payment_type,
            method: paymentInfo.payment_method,
            status: EPaymentStatus.PENDING
        };

        paymentData.channel = paymentInfo.payment_channel ? paymentInfo.payment_channel : '';
        paymentData.reference_number = paymentInfo.reference_number ? paymentInfo.reference_number : '';
        paymentData.account_name = paymentInfo.account_name ? paymentInfo.account_name : '';
        paymentData.account_number = paymentInfo.account_number ? paymentInfo.account_number : '';
        paymentData.account_bank = paymentInfo.account_bank ? paymentInfo.account_bank : '';
        paymentData.payment_reference_number = paymentInfo.payment_reference_number
            ? paymentInfo.payment_reference_number
            : '';

        paymentData.events = [
            {
                type: 'PAYMENT',
                total_amount: paymentData.total_amount as number,
                status: paymentData.status,
                method: paymentData.method,
                channel: paymentData.channel,
                account_number: paymentData.account_number,
                event_type: event,
                timestamp: new Date().toISOString()
            }
        ];

        return paymentData;
    }

    async createVa(
        payment: Payments,
        transaction_number: string,
        name: string,
        expirationDate: string
    ): Promise<Payments> {
        const newPayment = payment;

        const vaResponse = await this.xenditClient.create({
            externalID: transaction_number,
            amount: payment.total_amount,
            billTo: name,
            bank: payment.channel,
            expirationDate
        });

        newPayment.account_number = vaResponse.account_number;
        newPayment.account_name = vaResponse.name;
        newPayment.reference_number = vaResponse.id;
        newPayment.events.push({
            type: 'PAYMENT',
            total_amount: payment.total_amount,
            status: payment.status,
            method: payment.method,
            channel: payment.channel,
            account_number: vaResponse.account_number,
            reference_number: vaResponse.id,
            event_type: EPaymentEventType.CREATE_VA,
            timestamp: new Date().toISOString()
        });

        return this.paymentRepository.save(newPayment);
    }

    async expireVA(referenceNumber: string): Promise<void> {
        const expirationDate = subDays(new Date(), 1);
        await this.xenditClient.update(referenceNumber, null, expirationDate);
    }

    async completeCardPayment(order: Orders): Promise<Orders> {
        const { payment } = order;
        payment.status = EPaymentStatus.SUCCESS;
        payment.events.push({
            type: 'PAYMENT',
            total_amount: payment.total_amount,
            status: EPaymentStatus.SUCCESS,
            method: payment.method,
            channel: payment.channel,
            account_number: payment.account_number,
            event_type: EPaymentEventType.PAID,
            timestamp: new Date().toISOString()
        });
        order.payment = payment;
        return this.repository.save(order);
    }

    async completePaymentAfterCompleteOrder(order: Orders): Promise<Orders> {
        const user = await this.userRepository.findOne(order.user_id);
        const { payment } = order;
        payment.status = EPaymentStatus.SUCCESS;
        payment.events.push({
            type: 'PAYMENT',
            total_amount: payment.total_amount,
            status: EPaymentStatus.SUCCESS,
            method: EPaymentMethod.LOAN,
            channel: payment.channel,
            account_number: payment.account_number,
            event_type: EPaymentEventType.PAID,
            timestamp: new Date().toISOString()
        });
        const userLoanLimit = user.loan_limit;
        const userLoanLevel = user.loan_level;
        if (userLoanLevel !== 0) {
            await this.userRepository.changeLoanLimit(order.user_id, userLoanLimit + payment.total_amount);
        }
        order.payment = payment;
        return this.repository.save(order);
    }

    async completePayment(order: Orders, paymentRefNumber?: string): Promise<Orders> {
        const user = await this.userRepository.findOne(order.user_id);
        const { payment } = order;
        const completedOrder = await this.repository.findCompletedOrderByUserId(order.user_id);
        const orderedProduct = [];

        for (let i = 0; i < order.carts.length; i += 1) {
            const cart = order.carts[i];
            const { quantity } = cart;

            orderedProduct.push({
                product_sku: '', // productSku,
                quantity,
                discount: cart.discount_percentage,
                dpf: cart.product.dpf
            });
        }

        const updatedOrder = order;

        payment.status = EPaymentStatus.SUCCESS;
        payment.payment_reference_number = paymentRefNumber;
        payment.events.push({
            type: 'PAYMENT',
            total_amount: payment.total_amount,
            status: EPaymentStatus.SUCCESS,
            method: EPaymentMethod.LOAN,
            channel: payment.channel,
            account_number: payment.account_number,
            event_type: EPaymentEventType.PAID,
            timestamp: new Date().toISOString()
        });
        updatedOrder.payment = payment;
        updatedOrder.order_events = this.addOrderEvents(updatedOrder, 'ADMIN');

        const isAllPaid = completedOrder.every((val, i, arr) => val.payment.status === EPaymentStatus.SUCCESS);

        const paidStatus = completedOrder.map((v, k) => {
            return v.payment.status;
        });

        console.log(paidStatus, `all paid? ${isAllPaid}`);

        if (isAllPaid) {
            const userLoanLevel = user.loan_level;
            if (userLoanLevel !== 0) {
                await this.userRepository.changeLoanLimit(order.user_id, user.outlet_types_id.loan_limit);
            }
        }

        await this.userRepository.changeLoanLimit(order.user_id, user.loan_limit + payment.total_amount);

        return this.repository.save(updatedOrder);
    }

    async cancelOrder(order: Orders, user: string): Promise<Orders> {
        const { carts, payment } = order;

        // mark cart as failed
        for (let i = 0; i < carts.length; i += 1) {
            carts[i].status = CartStatuses.FAILED;
            await this.cartRepository.save(carts[i]);
        }

        // expire VA if exists
        if (payment.method === EPaymentMethod.XENDIT_VA) {
            await this.expireVA(payment.reference_number);
        }

        order.status = OrderStatuses.CANCELED;
        order.order_events = this.addOrderEvents(order, user);

        return this.repository.save(order);
    }

    async updateDeliveredOrder(
        order: Orders,
        paid?: boolean,
        shipmentData?: { receiver_name: string }
    ): Promise<Orders> {
        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Order tidak ditemukan');
        }

        if (order.status === OrderStatuses.DELIVERED) {
            throw new ErrorObject(
                ErrorCodes.COMPLETE_ORDER_ERROR,
                'Tidak Bisa Mengirim pada Order ID yang Sudah Selesai'
            );
        }

        const { payment, shipment } = order;

        // if (paid && payment.type === EPaymentType.CASH_ON_DELIVERY) {
        //     payment.status = EPaymentStatus.SUCCESS;
        //     payment.events.push({
        //         type: 'PAYMENT',
        //         total_amount: payment.total_amount,
        //         status: EPaymentStatus.SUCCESS,
        //         channel: payment.channel,
        //         event_type: EPaymentEventType.PAID,
        //         timestamp: new Date().toISOString()
        //     });
        // }

        order.status = OrderStatuses.DELIVERED;
        order.completion_deadline = addDays(new Date(), 1).toISOString();
        shipment.receiver_name = shipmentData.receiver_name;
        shipment.receive_date = new Date().toISOString();

        order.payment = payment;
        order.shipment = shipment;
        order.order_events = this.addOrderEvents(order, 'ADMIN');

        return this.repository.save(order);
    }

    async generateInvoice(transaction_number: string, invoice_type: string) {
        const order = await this.findByTransactionNumber(transaction_number);

        const html =
            order.payment.status === EPaymentStatus.SUCCESS
                ? fs.readFileSync(path.join(__dirname, `../../../public/template/invoice.html`), 'utf-8')
                : fs.readFileSync(path.join(__dirname, `../../../public/template/invoice2.html`), 'utf-8');

        const user = await this.userRepository.findOneWithOutlets({
            where: { id: order.user_id },
            relations: ['outlets', 'outlet_addresses']
        });

        const mainAddress = user?.outlet_addresses?.find((address) => address.is_main) || user?.outlet_addresses[0];
        const currencyConverter = (num: number) =>
            new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(num);

        const generatePriceFromCart = (cart: Carts) => {
            if (cart.discount_percentage) {
                return Math.ceil(cart.unit_price - (cart.discount_percentage / 100) * cart.unit_price);
            }

            return cart.unit_price;
        };

        const formatDate = (date: string) => format(new Date(date), 'dd MMMM yyyy', { locale: id });

        const calculateSubTotal = (carts: any[]) => {
            return currencyConverter(
                carts.reduce((sum: any, cart: { final_unit_price: any }) => sum + cart.final_unit_price, 0)
            );
        };
        const filename = `${invoice_type}_${order.transaction_number}.pdf`;

        if (fs.existsSync(path.join(__dirname, `../../../public/invoice/${filename}`))) {
            fs.unlinkSync(path.join(__dirname, `../../../public/invoice/${filename}`));
        }

        const items = order.carts.map((cart) => {
            return {
                ...cart,
                converted: {
                    price: cart.discount_percentage
                        ? currencyConverter(cart.unit_price - generatePriceFromCart(cart))
                        : currencyConverter(0),
                    price_normal: currencyConverter(cart.unit_price),
                    discount: cart.discount_percentage ? `${cart.discount_percentage}%` : '0%',
                    final_unit: currencyConverter(cart.final_unit_price)
                }
            };
        });

        const options = {
            format: 'A4',
            orientation: 'portrait'
        };

        const document = {
            html,
            path: `./public/invoice/${invoice_type}_${order.transaction_number}.pdf`,
            data: {
                order,
                user,
                createdAt: formatDate(order.created_at),
                mainAddress,
                items,
                invoice_type: invoice_type.toUpperCase(),
                subTotal: calculateSubTotal(order.carts),
                outlet_type: order.user.outlet_types_id,
                converted: {
                    order_discount: currencyConverter(order.payment.order_discount),
                    channel_fee: currencyConverter(order.payment.channel_fee),
                    tax: currencyConverter(order.payment.tax),
                    total_amount: currencyConverter(order.payment.total_amount)
                }
            },
            type: ''
        };

        return pdf.create(document, options);
    }

    async generateFaktur(transaction_number: string, fakturType: string) {
        const html = fs.readFileSync(path.join(__dirname, `../../../public/template/faktur.html`), 'utf-8');

        const order = await this.repository.getFakturByTransactionNumber(transaction_number);

        const user = await this.userRepository.findOne(order.user_id);

        const mainAddress = '';

        const currencyConverter = (num: number) =>
            new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(num);

        const generatePriceFromCart = (cart: Carts) => {
            return cart.unit_price;
        };

        const formatDate = (date: string) => format(new Date(date), 'dd MMMM yyyy', { locale: id });

        const calculateSubTotal = (carts: any[]) => {
            return currencyConverter(
                carts.reduce((sum: any, cart: { final_unit_price: any }) => sum + cart.final_unit_price, 0)
            );
        };
        const filename = `${fakturType}_${order.transaction_number}.pdf`;

        const alreadyExist = fs.existsSync(path.join(__dirname, `../../../public/invoice/${filename}`));

        if (alreadyExist) {
            fs.unlinkSync(path.join(__dirname, `../../../public/invoice/${filename}`));
        }

        const items = order.carts.map((cart) => {
            return {
                ...cart,
                exp_date: formatDate(cart.product.valid_to),
                converted: {
                    price: cart.discount_percentage
                        ? currencyConverter(cart.unit_price - generatePriceFromCart(cart))
                        : currencyConverter(0),
                    price_normal: currencyConverter(cart.unit_price),
                    discount: cart.discount_percentage ? `${cart.discount_percentage}%` : '0%',
                    final_unit: currencyConverter(cart.final_unit_price)
                }
            };
        });

        const options = {
            format: 'A4',
            orientation: 'portrait'
        };

        const document = {
            html,
            path: `./public/invoice/${fakturType}_${order.transaction_number}.pdf`,
            data: {
                order,
                user,
                createdAt: formatDate(order.created_at),
                mainAddress,
                items,
                fakturType,
                subTotal: calculateSubTotal(order.carts),
                outlet_type: order.user.outlet_types_id,
                converted: {
                    order_discount: currencyConverter(order.payment.order_discount),
                    channel_fee: currencyConverter(order.payment.channel_fee),
                    tax: currencyConverter(order.payment.tax),
                    total_amount: currencyConverter(order.payment.total_amount)
                }
            },
            type: ''
        };

        return pdf.create(document, options);
    }

    private addOrderEvents(order: Orders, user: string, sn?: string) {
        const newOrderEvents: IOrderEvents[] = [
            {
                type: 'ORDER',
                status: order.status,
                timestamp: new Date().toISOString(),
                email: user,
                serial_number: sn ? sn : ''
            }
        ];
        return order.order_events && order.order_events.length
            ? order.order_events.concat(newOrderEvents)
            : newOrderEvents;
    }

    async countAll() {
        return this.repository.countAll();
    }

    async countFiltered(query: any) {
        return this.repository.countFiltered(query);
    }

    public async addToCartInvoice(cartData: IInvocieCartCreateRequest): Promise<Carts> {
        const order = await this.repository.findOrderByTransactionNumber(cartData.transaction_number);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Order tidak ditemukan');
        }
        if (cartData.quantity > MAX_CART_QUANTITY) {
            throw new ErrorObject(
                ErrorCodes.ADD_TO_CART_ERROR,
                `Maks ${MAX_CART_QUANTITY} item per produk dalam keranjang`
            );
        }

        const product = await this.productRepository.findOne(cartData.product_id);
        const user = await this.userRepository.findOneWithOutlets({
            where: { id: order.user_id },
            relations: ['outlets']
        });

        if (!product) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan');
        }

        if (
            product.status !== ProductStatuses.ACTIVE ||
            (product.valid_to && new Date(product.valid_to) < new Date())
        ) {
            throw new ErrorObject(ErrorCodes.PRODUCT_NOT_FOUND_ERROR, 'Produk tidak ditemukan');
        }

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'Akun tidak ditemukan');
        }

        if (
            user.role_status === ERoleStatus.BASIC_USER ||
            user.role_status === ERoleStatus.UNVERIFIED_USER ||
            user.role_status === ERoleStatus.INACTIVE_ADMIN ||
            user.role_status === ERoleStatus.ADMIN
        ) {
            throw new ErrorObject(
                ErrorCodes.UNAUTHORIZED_ACTION,
                'Akun belum diautorisasi atau belum memasukkan customer Id'
            );
        }

        const existingCart = await this.cartRepository.findExistingInvoiceCart(
            cartData.product_id,
            order.id,
            cartData.location
        );
        let resultCart: Carts;

        if (!existingCart) {
            const promoDiscount = await this.tieredPromotionFinalUnitPrice(product, cartData.quantity);
            const finalUnitPrice =
                cartData.quantity * (product.price - Math.ceil(product.price * (promoDiscount / 100)));
            const newCartData = {
                ...cartData,
                user_id: order.user_id,
                status: CartStatuses.ORDERED,
                final_unit_price: finalUnitPrice,
                unit_price: product.price,
                discount_percentage: promoDiscount,
                product,
                order
            };

            resultCart = this.cartRepository.create(newCartData);
        } else {
            const updatedQuantity = existingCart.quantity + cartData.quantity;
            const promoDiscount = await this.tieredPromotionFinalUnitPrice(product, updatedQuantity);
            const finalUnitPrice = updatedQuantity * (product.price - Math.ceil(product.price * (promoDiscount / 100)));

            if (updatedQuantity > MAX_CART_QUANTITY) {
                throw new ErrorObject(
                    ErrorCodes.ADD_TO_CART_ERROR,
                    `Maks ${MAX_CART_QUANTITY} item per produk dalam keranjang`
                );
            }

            resultCart = {
                ...existingCart,
                quantity: updatedQuantity,
                final_unit_price: finalUnitPrice,
                unit_price: product.price,
                // discount_percentage: product.discount_percentage,
                discount_percentage: promoDiscount,
                product: existingCart.product
            };
        }

        const cart = await this.cartRepository.save(resultCart);

        await this.calculatePaymentAfterEditInvoice(order.id, order.payment.id);

        return cart;
    }

    public async updateInvoiceCart(cartData: IInvoiceCartUpdateRequest): Promise<Carts> {
        const order = await this.repository.findOrderByTransactionNumber(cartData.transaction_number);
        const product = await this.productRepository.findOne(cartData.product_id);
        const promoDiscount = await this.tieredPromotionFinalUnitPrice(product, cartData.quantity);
        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Order tidak ditemukan');
        }

        if (cartData.quantity > MAX_CART_QUANTITY) {
            throw new ErrorObject(
                ErrorCodes.ADD_TO_CART_ERROR,
                `Maks ${MAX_CART_QUANTITY} item per produk dalam keranjang`
            );
        }

        const cart = await this.cartRepository.findOneInvoiceCart(cartData.cart_id, order.id);

        if (!cart) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak ditemukan');
        }

        if (cart.status !== CartStatuses.ORDERED) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak aktif');
        }

        const updatedCart = {
            ...cart,
            quantity: cartData.quantity,
            unit_price: product.price,
            final_unit_price:
                // cartData.quantity * (cartData.price - Math.ceil(cartData.price * (cartData.discount / 100))),
                cartData.quantity * (product.price - Math.ceil(product.price * (promoDiscount / 100))),
            discount_percentage: promoDiscount
        };

        const cartResponse = await this.cartRepository.save(updatedCart);

        await this.calculatePaymentAfterEditInvoice(order.id, order.payment.id);

        return cartResponse;
    }

    public async softDeleteInvoice(transactionNumber: string, cartId: string): Promise<Carts> {
        const order = await this.repository.findOrderByTransactionNumber(transactionNumber);

        if (!order) {
            throw new ErrorObject(ErrorCodes.ORDER_NOT_FOUND_ERROR, 'Order tidak ditemukan');
        }

        const cart = await this.cartRepository.findOneInvoiceCart(cartId, order.id);

        if (!cart) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak ditemukan');
        }

        if (cart.status !== CartStatuses.ORDERED) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak aktif');
        }

        const deletedCart = {
            ...cart,
            status: CartStatuses.DELETED,
            order_id: null
        };

        const cartResponse = await this.cartRepository.save(deletedCart);

        await this.calculatePaymentAfterEditInvoice(order.id, order.payment.id);

        return cartResponse;
    }

    private async tieredPromotionFinalUnitPrice(product: any, quantity: number): Promise<number> {
        const promotions = await this.productRepository.findPromotionForProductById(product.id);
        let promoValue = 0;

        if (promotions) {
            promotions.forEach((promotion) => {
                const percentagePromo = Number(promotion.percentage);
                if (quantity >= promotion.qty_min && quantity <= promotion.qty_max) {
                    promoValue = percentagePromo;
                }
            });
        }

        return promoValue;
    }

    public async calculatePaymentAfterEditInvoice(orderId: string, paymentId: string): Promise<Payments> {
        const carts = await this.cartRepository.findOrderedCartByOrderId(orderId);
        let productPrice = 0;

        carts.forEach((cart) => {
            productPrice += cart.final_unit_price;
        });
        const tax = Math.ceil((TAX_PERCENTAGE / 100) * productPrice);

        const payment = await this.paymentRepository.findOne(paymentId);

        payment.product_price = productPrice;
        payment.tax = tax;
        payment.total_amount = productPrice + tax;

        return this.paymentRepository.save(payment);
    }

    async getOrderByUserId(userId: string) {
        const html = fs.readFileSync(path.join(__dirname, `../../../public/template/tanda-terima.html`), 'utf-8');

        const orderArr = await this.repository.findOrderByUserId(userId);

        const user = await this.userRepository.findOneWithOutlets({
            where: { id: userId },
            relations: ['outlets', 'outlet_addresses']
        });

        const formatDate = (date: string) => format(new Date(date), 'dd MMMM yyyy', { locale: id });

        let carts: Carts[];
        let cartObj: Carts;
        let payments: Payments;
        let orderObj: Orders;
        orderArr.forEach((order) => {
            const cartArr = order.carts;
            const { payment } = order;
            carts = cartArr;
            payments = payment;
            orderObj = order;
        });

        carts.forEach((cart) => {
            cartObj = cart;
        });

        const mainAddress = user?.outlet_addresses?.find((address) => address.is_main) || user?.outlet_addresses[0];

        const currencyConverter = (num: number) =>
            new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(num);

        const calculateSubTotal = (carts: any[]) => {
            return currencyConverter(
                carts.reduce((sum: any, cart: { final_unit_price: any }) => sum + cart.final_unit_price, 0)
            );
        };

        const filename = `TandaTerima_${user.id}.pdf`;

        if (fs.existsSync(path.join(__dirname, `../../../public/invoice/${filename}`))) {
            return { filename: path.join(__dirname, `../../../public/invoice/${filename}`) };
        }

        const options = {
            format: 'A4',
            orientation: 'portrait'
        };

        const items = orderArr.map((order) => {
            return {
                ...order,
                subTotal: calculateSubTotal(carts),
                inv_date: formatDate(order.payment.invoice_date),
                paid: format(order.payment.created, 'dd MMMM yyyy', { locale: id }),
                expired: formatDate(order.completion_deadline),
                notes: mainAddress.notes || '-'
            };
        });

        const document = {
            html,
            path: `./public/invoice/${filename}`,
            data: {
                items,
                user,
                carts,
                outlet: user.outlets,
                mainAddress,
                now: format(new Date(), 'dd MMMM yyyy', { locale: id }),
                paid: items[0].paid
            }
        };

        console.log(JSON.parse(JSON.stringify(document.data)));
        return pdf.create(document, options);
        // return orderArr;
    }

    async generateFakturPpob(transaction_number: string, fakturType: string, inquiry?: any, downloadPdf?: boolean) {
        const html = fs.readFileSync(path.join(__dirname, `../../../public/template/faktur-ppob.html`), 'utf-8');

        const order = await this.repository.getFakturByTransactionNumber(transaction_number);

        const user = await this.userRepository.findOne(order.user_id);

        const mainAddress = '';

        const currencyConverter = (num: number) =>
            new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(num);

        const generatePriceFromCart = (cart: Carts) => {
            return cart.unit_price;
        };

        const formatDate = (date: string) => format(new Date(date), 'dd MMMM yyyy', { locale: id });

        const calculateSubTotal = (carts: any[]) => {
            return currencyConverter(
                carts.reduce((sum: any, cart: { final_unit_price: any }) => sum + cart.final_unit_price, 0)
            );
        };
        const filename = `${fakturType}_${order.transaction_number}.pdf`;

        const alreadyExist = fs.existsSync(path.join(__dirname, `../../../public/invoice/${filename}`));

        if (alreadyExist) {
            fs.unlinkSync(path.join(__dirname, `../../../public/invoice/${filename}`));
        }

        const items = order.carts.map((cart) => {
            return {
                ...cart,
                exp_date: formatDate(cart.product.valid_to),
                converted: {
                    price: cart.discount_percentage
                        ? currencyConverter(cart.unit_price - generatePriceFromCart(cart))
                        : currencyConverter(0),
                    price_normal: currencyConverter(cart.unit_price),
                    discount: cart.discount_percentage ? `${cart.discount_percentage}%` : '0%',
                    final_unit: currencyConverter(cart.final_unit_price)
                }
            };
        });

        const options = {
            format: 'A4',
            orientation: 'portrait'
        };

        const document = {
            html,
            path: `./public/invoice/${fakturType}_${order.transaction_number}.pdf`,
            data: {
                order,
                inquiry,
                user,
                createdAt: formatDate(order.created_at),
                items,
                fakturType,
                subTotal: calculateSubTotal(order.carts),
                status: order.status === OrderStatuses.COMPLETED ? 'Transaksi Berhasil' : 'Transaksi Tidak Berhasil'
            },
            type: ''
        };

        if (downloadPdf === true) {
            return pdf.create(document, options);
        }

        return document.data;
    }
}
