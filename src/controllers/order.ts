/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/namespace */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import qs from 'querystring';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { Router, Response, NextFunction } from 'express';
import { IOrderService } from 'src/services/order';
import { INotificationService } from 'src/services/notification';
import { NotificationMessage } from 'src/models/Notifications';
import { EPaymentStatus } from 'src/models/Payments';
import { Carts } from 'src/models/carts';
import { Orders } from 'src/models/orders';
import { EProductTypes } from 'src/models/products';
import { PpobService } from 'src/services/ppob';
import { Ppob } from 'src/models/ppobs';
import { authentication, adminAuthentication, IRequestExtra } from './middlewares/authentication';

export class OrderController {
    private readonly orderService: IOrderService;

    private readonly notificationService: INotificationService;

    private ppobService: PpobService;

    private router: Router;

    private invoiceType: string;

    private fakturType: string;

    public constructor(
        orderService: IOrderService,
        type: string,
        notificationService: INotificationService,
        ppobService: PpobService
    ) {
        this.orderService = orderService;
        this.notificationService = notificationService;
        this.ppobService = ppobService;
        this.router = Router();
        this.router.get('/count', this.count.bind(this));

        if (type === 'ADMIN') {
            this.invoiceType = 'Faktur';
            this.fakturType = 'Surat Pesanan';
            this.router.get('/:transaction_number/invoice', this.generateInvoice.bind(this));
            this.router.get('/:transaction_number/faktur', this.generateFaktur.bind(this));
            this.router.get('/export-excel', this.exportExcelOrder.bind(this));
            this.router.use(adminAuthentication);
            this.router.get('/', this.getAllForAdmin.bind(this));
            this.router.patch('/:id', this.inputInvoiceNumberByAdmin.bind(this));
            this.router.get('/:transaction_number/get-faktur', this.getFakturByTransactionNumberForAdmin.bind(this));
            this.router.get('/:transaction_number', this.getByTransactionNumberForAdmin.bind(this));
            this.router.post('/:transaction_number/add-product', this.addCartByTransactionNumberForAdmin.bind(this));
            this.router.patch('/:transaction_number/update-cart', this.editCartByTransactionNumberForAdmin.bind(this));
            this.router.delete(
                '/:transaction_number/delete-product',
                this.deleteCartByTransactionNumberForAdmin.bind(this)
            );
            this.router.post('/:transaction_number/complete_payment', this.completePayment.bind(this));
            this.router.post('/:transaction_number/cancel', this.cancelOrderAdmin.bind(this));
            this.router.post('/:transaction_number/delivered', this.deliveredOrderByAdmin.bind(this));
            this.router.post('/:transaction_number/ongoing', this.ongoingOrderByAdmin.bind(this));
            this.router.post('/:transaction_number/refund', this.refundPayment.bind(this));
        } else {
            this.invoiceType = 'Invoice';
            this.router.get('/:transaction_number/invoice', this.generateInvoice.bind(this));
            this.router.get('/:transaction_number/invoice-ppob', this.generateFakturPpob.bind(this));
            this.router.use(authentication);
            this.router.get('/', this.get.bind(this));
            this.router.get('/:id', this.getById.bind(this));
            this.router.post('/', this.post.bind(this));
            this.router.patch('/:id', this.update.bind(this));
            this.router.post('/:id/cancel', this.cancelOrderUser.bind(this));
            this.router.post('/:id/complete', this.completeOrder.bind(this));
            this.router.post('/:id/charge', this.chargeCardPayment.bind(this));
        }
    }

    getRouter(): Router {
        return this.router;
    }

    public async count(req: IRequestExtra, res: Response, next: NextFunction): Promise<any> {
        const count = await this.orderService.countAll();

        return res.status(200).json(count);
    }

    public async get(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const orders = await this.orderService.findForUser(userId);

            return res.status(200).json(orders);
        } catch (err) {
            return next(err);
        }
    }

    public async getAllForAdmin(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const query = qs.parse(req.url.substr(2, req.url.length));
            const orders = await this.orderService.findForAdmin(query, false);
            const { totalOrder } = await this.orderService.countAll();
            const totalFiltered = await this.orderService.countFiltered(query);
            let totalPage: number;
            if (query.search || query.client || query.start_date || query.end_date) {
                totalPage = Math.ceil(Number(totalFiltered.total) / Number(query.limit));
            } else {
                totalPage = Math.ceil(Number(totalOrder) / Number(query.limit));
            }

            return res.status(200).json({
                page: Number(query.page),
                limit: Number(query.limit),
                totalPage,
                totalFiltered: Number(totalFiltered.total),
                orders
            });
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const order = await this.orderService.findByIdForUser(userId, req.params.id);

            let ppob: Ppob;
            if (order.carts[0].product.product_type === EProductTypes.PPOB) {
                ppob = await this.ppobService.findOne(order.carts[0].product.sku_number);
            }

            return res.status(200).json({ order, ppob });
        } catch (err) {
            return next(err);
        }
    }

    public async getFakturByTransactionNumberForAdmin(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const order = await this.orderService.getByTransactionNumber(req.params.transaction_number);
            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async getByTransactionNumberForAdmin(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const order = await this.orderService.findByTransactionNumber(req.params.transaction_number);

            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async addCartByTransactionNumberForAdmin(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const request = {
                ...req.body,
                transaction_number: req.params.transaction_number
            };
            const carts = await this.orderService.addToCartInvoice(request);
            // const payment = await this.orderService.calculatePaymentAfterEditInvoice(req.params.transaction_number);

            return res.status(201).json(carts);
        } catch (err) {
            return next(err);
        }
    }

    public async editCartByTransactionNumberForAdmin(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const request = {
                ...req.body,
                transaction_number: req.params.transaction_number
            };
            const order = await this.orderService.updateInvoiceCart(request);

            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async deleteCartByTransactionNumberForAdmin(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const cart = await this.orderService.softDeleteInvoice(req.params.transaction_number, req.body.cart_id);

            return res.status(200).json(cart);
        } catch (err) {
            return next(err);
        }
    }

    public async post(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const order = await this.orderService.createOrder({
                shipment: req.body.shipment,
                payment: req.body.payment,
                carts: req.body.carts,
                user_id: req.user.id
            });

            await this.notificationService.createNotification(req.user.id, NotificationMessage.CREATED, order.id);

            return res.status(201).json(order);
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const order = await this.orderService.updatePayment({
                user_id: userId,
                id: req.params.id,
                payment: {
                    total_price: req.body.payment.total_price,
                    payment_method: req.body.payment.payment_method,
                    payment_channel: req.body.payment.payment_channel,
                    account_number: req.body.payment.account_number,
                    account_name: req.body.payment.account_name,
                    account_bank: req.body.payment.account_bank
                }
            });

            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async completePayment(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const order = await this.orderService.completePaymentByAdmin(req.params.transaction_number);

            await this.notificationService.createNotification(
                order.user_id,
                NotificationMessage.CONFIRM_PAYMENT,
                order.id
            );

            // console.log(`Admin with email: ${req.user.email} complete the order ${order.transaction_number}`);
            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async chargeCardPayment(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const { body, params } = req;
            const chargeData = {
                externalID: body.externalID,
                tokenID: body.tokenID,
                authID: body.authID,
                amount: body.amount,
                cardCVN: body.cardCvn,
                currency: 'IDR',
                midLabel: 'IDR_MID',
                promoCode: body.promoCode
            };

            const chargePayment = await this.orderService.chargeCardPayment(userId, params.id, chargeData);

            if (chargePayment.message === 'success') {
                await this.notificationService.createNotification(
                    userId,
                    NotificationMessage.SUCCESS,
                    chargePayment.orderId
                );
            }

            // await this.notificationService.createNotification(
            //     order.user_id,
            //     NotificationMessage.CONFIRM_PAYMENT,
            //     order.id
            // );

            console.log(`Admin with email: ${req.user.email} charge payment order ${chargePayment}`);
            return res.status(200).json(chargePayment);
        } catch (err) {
            return next(err);
        }
    }

    public async cancelOrderAdmin(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const order = await this.orderService.cancelOrderAdmin(req.params.transaction_number);

            await this.notificationService.createNotification(order.user_id, NotificationMessage.CANCELED, order.id);

            console.log(`Admin with email: ${req.user.email} cancel the order ${order.transaction_number}`);
            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async cancelOrderUser(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id, email } = req.user;

            const order = await this.orderService.cancelOrderUser(req.params.id, id, email);

            await this.notificationService.createNotification(order.user_id, NotificationMessage.CANCELED, order.id);

            console.log(`Admin with email: ${req.user.email} cancel the order ${order.transaction_number}`);
            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async deliveredOrderByAdmin(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { body, query, params } = req;
            const order = await this.orderService.deliveredOrderByAdmin(
                params.transaction_number,
                query.paid as string,
                body.receiver_name
            );
            await this.notificationService.createNotification(order.user_id, NotificationMessage.DELIVERED, order.id);
            console.log(`Admin with email: ${req.user.email} mark order ${order.transaction_number} as delivered`);
            return res.status(200).json(order);
        } catch (error) {
            return next(error);
        }
    }

    public async inputInvoiceNumberByAdmin(
        req: IRequestExtra,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { params, body } = req;

            const payload = {
                id: params.id,
                invoice_no: body.invoice_no,
                invoice_date: new Date().toISOString()
            };

            const invoice = await this.orderService.confirmDeliveryByAdmin(payload);

            console.log(`Admin with email: ${req.user.email} added invoice to an order with payment_id ${params.id}.`);

            return res.status(200).json(invoice);
        } catch (error) {
            return next(error);
        }
    }

    public async ongoingOrderByAdmin(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { params, body } = req;
            const order = await this.orderService.ongoingOrderByAdmin(params.transaction_number, body.faktur);
            await this.notificationService.createNotification(order.user_id, NotificationMessage.ONGOING, order.id);

            console.log(
                `Admin with email: ${req.user.email} mark order ${order.transaction_number} as ongoing and adding invoice number ${body.faktur}`
            );

            return res.status(200).json(order);
        } catch (error) {
            return next(error);
        }
    }

    public async completeOrder(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const { id, email } = req.params;

            const order = await this.orderService.completeOrder(userId, id, email);

            await this.notificationService.createNotification(order.user_id, NotificationMessage.SUCCESS, order.id);

            return res.status(200).json(order);
        } catch (err) {
            return next(err);
        }
    }

    public async refundPayment(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const order = await this.orderService.refundPayment(req.params.transaction_number);

            console.log(`Admin with email: ${req.user.email} refund payment for order ${order.transaction_number}`);
            return res.status(200).json(order);
        } catch (error) {
            return next(error);
        }
    }

    public async generateInvoice(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.orderService.generateInvoice(req.params.transaction_number, this.invoiceType);

            return res.status(200).download(result.filename);
        } catch (error) {
            return next(error);
        }
    }

    public async generateFaktur(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const result = await this.orderService.generateFaktur(req.params.transaction_number, this.fakturType);

            return res.status(200).download(result.filename);
        } catch (error) {
            return next(error);
        }
    }

    private fixWidth(worksheet: xlsx.WorkSheet) {
        const data = xlsx.utils.sheet_to_json<any>(worksheet);
        const colLengths = Object.keys(data[0]).map((k) => k.toString().length);
        for (const d of data) {
            Object.values(d).forEach((element: any, index) => {
                const { length } = element.toString();
                if (colLengths[index] < length) {
                    colLengths[index] = length;
                }
            });
        }
        worksheet['!cols'] = colLengths.map((l) => {
            return {
                wch: l
            };
        });
    }

    public async exportExcelOrder(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const query = qs.parse(req.url.substring(14));

            const data = await this.orderService.findForAdmin(query, true);

            const currency = (number: number) => {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                }).format(number);
            };

            const users = data.map((v: Orders) => {
                const productNames = v.carts.map((o: Carts) => {
                    return o.product.name;
                });
                return [
                    v.transaction_number,
                    v.user.name,
                    productNames.join(', '),
                    currency(v.payment.total_amount),
                    v.payment.status === EPaymentStatus.SUCCESS ? 'Lunas' : 'Belum Lunas',
                    v.status,
                    v.created_at
                ];
            });

            const filePath = `${process.cwd()}/public/tmp/${query.client}_${query.start_date}_${
                query.end_date
            }_OrderList.xlsx`;

            const sheetColumnName = [
                'Transaction No',
                'Customer Name',
                'Product Name',
                'Total',
                'Payment Status',
                'Status',
                'Order Date'
            ];

            const workBook = xlsx.utils.book_new();

            const workSheetData = [sheetColumnName, ...users];

            const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);

            this.fixWidth(workSheet);

            xlsx.utils.book_append_sheet(workBook, workSheet);

            xlsx.writeFile(workBook, path.resolve(filePath));

            res.download(filePath);

            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err) console.log(err);
                });
            }, 20000);
        } catch (err) {
            return next(err);
        }
    }

    public async generateFakturPpob(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const order = await this.orderService.findByTransactionNumber(req.params.transaction_number);
            const inquiry = await this.ppobService.checkoutForUser(
                order.payment.account_number,
                order.payment.account_bank
            );
            const result = await this.orderService.generateFakturPpob(
                req.params.transaction_number,
                this.invoiceType,
                inquiry
            );

            // return res.status(200).json(result);
            return res.status(200).download(result.filename);
        } catch (err) {
            return next(err);
        }
    }
}
