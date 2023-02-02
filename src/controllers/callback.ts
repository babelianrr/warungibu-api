/* eslint-disable @typescript-eslint/no-unused-vars */
import qs from 'querystring';
import { Router, Request, Response, NextFunction } from 'express';
import { PaymentCallbackService } from 'src/services/paymentCallback';
import { OrderService } from 'src/services/order';
import { XENDIT_CALLBACK_VERIFICATION_TOKEN } from 'src/config';
import { IPaymentResponse, IPaymentCallback } from 'src/clients/xendit/xendit.interfaces';
import { ErrorCodes } from 'src/libs/errors';
import { INotificationService } from 'src/services/notification';
import { NotificationMessage } from 'src/models/Notifications';

export class CallbackController {
    private router: Router;

    private paymentCallbackService: PaymentCallbackService;

    private notificationService: INotificationService;

    private orderService: OrderService;

    public constructor(
        paymentCallbackService: PaymentCallbackService,
        orderService: OrderService,
        notificationService: INotificationService
    ) {
        this.paymentCallbackService = paymentCallbackService;
        this.notificationService = notificationService;
        this.orderService = orderService;
        this.router = Router();
        this.router.post('/', this.acceptPayment.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async receive(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            if (req.headers['x-callback-token'] !== XENDIT_CALLBACK_VERIFICATION_TOKEN) {
                console.log(req.headers);
                return res.status(400).json({ errorCode: 'INVALID_API_KEY', message: 'Invalid Credentials' });
            }

            console.log('Callback from XENDIT', req.body);

            const result = await this.paymentCallbackService.validate(req.body as IPaymentResponse);
            console.log('file: callback.ts ~ line 31 ~ CallbackController ~ receive ~ result', result);
            return res.status(200).json({ status: 'ok', message: 'oke' });
        } catch (err) {
            return next(err);
        }
    }

    public async acceptPayment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            if (req.headers['x-callback-token'] !== XENDIT_CALLBACK_VERIFICATION_TOKEN) {
                console.log(req.headers);
                return res.status(400).json({ errorCode: 'INVALID_API_KEY', message: 'Invalid Credentials' });
            }

            console.log('Callback from XENDIT', req.body);

            const order = await this.orderService.completePaymentWithVA(req.body as IPaymentCallback);

            await this.notificationService.createNotification(
                order.user_id,
                NotificationMessage.CONFIRM_PAYMENT,
                order.id
            );

            return res.status(200).json({ status: 'ok', message: 'oke' });
        } catch (err) {
            if (
                err.errorCode === ErrorCodes.COMPLETE_PAYMENT_ORDER_ERROR ||
                err.errorCode === ErrorCodes.ORDER_NOT_FOUND_ERROR
            ) {
                console.log(`Error completing payment: ${err.message}`);

                return res.status(200).json({ status: 'ok', message: 'oke' });
            }
            return next(err);
        }
    }
}
