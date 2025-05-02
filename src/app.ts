/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Application, RequestHandler } from 'express';
import httpContext from 'express-http-context';
import helmet from 'helmet';
import path from 'path';
import cors from 'cors';

import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import { PORT, TRANSPORTER } from 'src/config';
import { errorHandler } from 'src/controllers/middlewares/handle-error-code';

import { init } from 'src/init';
import { deactiveFlashSale } from './libs/cron-jobs/deactiveFlashSale';

// import OpenApiValidator from 'express-openapi-validator';

//  cron jobs
deactiveFlashSale();
/**
 * Setup the application routes with controllers
 * @param app
 */

async function routes(app: Application) {
    const {
        healthcheckController,
        rootController,
        categoryController,
        branchController,
        productController,
        paymentCallbackController,
        userController,
        userAdminController,
        outletController,
        outletAddressController,
        cartController,
        bankAccountController,
        orderController,
        adminCategoryController,
        adminOrderController,
        adminProductController,
        notificationController,
        reportController,
        bannerController,
        productReviewController,
        productReviewAdminController,
        flashSaleController,
        flashSaleAdminController,
        newsController,
        outletTypeController,
        promotionController,
        adminPromotionController,
        paymentTermsController,
        cartBatchController,
        ppobController,
        ppobAdminController
    } = await init();

    app.use('/', rootController.getRouter());
    app.use('/healthcheck', healthcheckController.getRouter());
    app.use('/users', userController.getRouter());
    app.use('/admin/users', userAdminController.getRouter());

    app.use('/categories', categoryController.getRouter());
    app.use('/admin/categories', adminCategoryController.getRouter());

    app.use('/outlets', outletController.getRouter());

    app.use('/outlet_addresses', outletAddressController.getRouter());

    app.use('/products', productController.getRouter());
    app.use('/admin/products', adminProductController.getRouter());

    app.use('/promotions', promotionController.getRouter());
    app.use('/admin/promotions', adminPromotionController.getRouter());

    app.use('/carts', cartController.getRouter());
    app.use('/carts_batch', cartBatchController.getRouter());
    app.use('/bank_accounts', bankAccountController.getRouter());

    app.use('/payment_terms', paymentTermsController.getRouter());

    app.use('/orders', orderController.getRouter());
    app.use('/admin/orders', adminOrderController.getRouter());

    app.use('/branch', branchController.getRouter());
    app.use('/notifications', notificationController.getRouter());
    app.use('/banners', bannerController.getRouter());
    app.use('/admin/products', adminProductController.getRouter());
    app.use('/admin/report', reportController.getRouter());
    app.use('/product_reviews', productReviewController.getRouter());
    app.use('/admin/product_reviews', productReviewAdminController.getRouter());

    app.use('/flash-sales', flashSaleController.getRouter());
    app.use('/admin/flash-sales', flashSaleAdminController.getRouter());

    app.use('/news', newsController.getRouter());
    app.use('/outlet_types', outletTypeController.getRouter());

    app.use('/ppob', ppobController.getRouter());
    app.use('/admin/ppob', ppobAdminController.getRouter());
}

export async function createApp(): Promise<express.Application> {
    const app = express();
    Sentry.init({
        dsn: 'https://e44dd5f71a0d464297fa9369aa176e29@o1077878.ingest.sentry.io/6087996',
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Tracing.Integrations.Express({ app })
        ],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 0.7
    });

    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    app.set('port', PORT);
    app.use(helmet() as RequestHandler);
    app.use(cors());
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../../public')));

    // app.use(
    //     OpenApiValidator.middleware({
    //         apiSpec,
    //         validateRequests: true, // (default)
    //         validateResponses: true, // false by default
    //         ignorePaths: /.*\/upload$/
    //     })
    // );

    app.use(httpContext.middleware);

    await routes(app);

    // The error handler must be before any other error middleware and after all controllers
    app.use(
        Sentry.Handlers.errorHandler({
            shouldHandleError(error) {
                return true;
                // Capture all 404 and 500 errors
                // if (error.status >= 400) {
                //     return true;
                // }
                // return false;
            }
        })
    );

    // verify connection configuration
    TRANSPORTER.verify((error, success) => {
        if (error) {
            console.log(error);
        } else {
            console.log('SMTP Server is ready to take our messages');
        }
    });

    app.use(errorHandler());
    return app;
}
