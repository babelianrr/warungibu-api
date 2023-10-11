/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import { getConnection, getCustomRepository } from 'typeorm';

import { NODE_ENV } from 'src/config';
import { connect } from 'src/db-connect';

import { HealthcheckController } from 'src/controllers/healthcheck';
import { CategoryController } from 'src/controllers/category';
import { BranchController } from 'src/controllers/branch';
import { ProductController } from 'src/controllers/product';
import { RootController } from 'src/controllers/root';
import { CallbackController } from 'src/controllers/callback';
import { CartController } from 'src/controllers/cart';
import { BankAccountController } from 'src/controllers/bank-account';
import { OrderController } from 'src/controllers/order';
import { NotificationController } from 'src/controllers/notification';
import { FlashSaleController } from 'src/controllers/flash-sale';
import { NewsController } from 'src/controllers/news';
import { PromotionController } from 'src/controllers/promotion';
import { HealthcheckService } from 'src/services/healthcheck';
import { CategoryService } from 'src/services/category';
import { BranchService } from 'src/services/branch';
import { ProductService } from 'src/services/product';
import { PaymentCallbackService } from 'src/services/paymentCallback';
import { CartService } from 'src/services/cart';
import { BankAccountService } from 'src/services/bank-account';
import { OrderService } from 'src/services/order';
import { NotificationService } from 'src/services/notification';
import { FlashSaleService } from 'src/services/flash-sale';
import { NewsService } from 'src/services/news';
import { PromotionService } from 'src/services/promotion';
import { PromotionProductService } from 'src/services/promotion-product';

import { CategoryRepository } from 'src/libs/database/repository/category';
import { BranchRepository } from 'src/libs/database/repository/branch';
import { ProductRepository } from 'src/libs/database/repository/product';
import { CartRepository } from 'src/libs/database/repository/cart';
import { BankAccountRepository } from 'src/libs/database/repository/bank-account';
import { OrderRepository } from 'src/libs/database/repository/order';
import { PaymentRepository } from 'src/libs/database/repository/Payment';
import { ShipmentRepository } from 'src/libs/database/repository/shipment';
import { NotificationRepository } from 'src/libs/database/repository/notification';
import { ProductImageRepository } from 'src/libs/database/repository/product_image';
import { FlashSaleRepository } from 'src/libs/database/repository/flash-sale';
import { NewsRepository } from 'src/libs/database/repository/news';
import { PaymentTermsController } from './controllers/payment-terms';
import { PaymentTermsRepository } from './libs/database/repository/payment-terms';
import { PaymentTermsService } from './services/payment-terms';
import { CartBatchService } from './services/carts-batch';
import { CartBatchController } from './controllers/carts-batch';
import { PromotionRepository } from './libs/database/repository/promotion';
import { PromotionProductsRepository } from './libs/database/repository/promotion_products';
import { OutletTypeService } from './services/outlet-type';
import { ProductReviewService } from './services/productReview';
import { BannerService } from './services/banner';
import { ProductReviewController } from './controllers/product-review';
import { BannerController } from './controllers/banner';
import { OutletTypeController } from './controllers/outlet-type';
import { OutletTypesRepository } from './libs/database/repository/outlet_types';

import { BannerRepository } from './libs/database/repository/banner';
import { ProductReviewRepository } from './libs/database/repository/product_review';

import { UserService } from './services/user';
import { OutletService } from './services/outlets';
import { OutletAddressService } from './services/outlet-address';
import { UserController } from './controllers/user';
import { OutletAddressController } from './controllers/outlet-address';
import { OutletController } from './controllers/outlet';
import { UserRepository } from './libs/database/repository/user';
import { OutletRepository } from './libs/database/repository/outlet';
import { OutletAddressRepository } from './libs/database/repository/outlet_address';
import { CartBatchRepository } from './libs/database/repository/carts-batch';

import { SendGrid } from './clients/sendgrid/sendgrid';
import { ReportService } from './services/report';
import { ReportController } from './controllers/report';
import { FirebaseAdmin } from './clients/firebase';
import CERT_FILE from '../firebase-admin-secret.json';
import { PpobRepository } from './libs/database/repository/ppob';
import { PpobService } from './services/ppob';
import { PpobController } from './controllers/ppob';

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function init(): Promise<Record<string, any>> {
    const environment = NODE_ENV;

    // client
    const sendGrid = new SendGrid();
    const firebase = new FirebaseAdmin(CERT_FILE);

    // repositories
    await connect();
    const categoryRepository = getCustomRepository(CategoryRepository);
    const branchRepository = getCustomRepository(BranchRepository);
    const productRepository = getCustomRepository(ProductRepository);
    const userRepository = getCustomRepository(UserRepository);
    const outletRepository = getCustomRepository(OutletRepository);
    const outletAddressRepository = getCustomRepository(OutletAddressRepository);
    const cartRepository = getCustomRepository(CartRepository);
    const bankAccountRepository = getCustomRepository(BankAccountRepository);
    const orderRepository = getCustomRepository(OrderRepository);
    const paymentRepository = getCustomRepository(PaymentRepository);
    const shipmentRepository = getCustomRepository(ShipmentRepository);
    const notificationRepository = getCustomRepository(NotificationRepository);
    const productImageRepository = getCustomRepository(ProductImageRepository);
    const bannerRepository = getCustomRepository(BannerRepository);
    const productReviewRepository = getCustomRepository(ProductReviewRepository);
    const flashSaleRepository = getCustomRepository(FlashSaleRepository);
    const newsRepository = getCustomRepository(NewsRepository);
    const outletTypeRepository = getCustomRepository(OutletTypesRepository);
    const promotionRepository = getCustomRepository(PromotionRepository);
    const promotionProductsRepository = getCustomRepository(PromotionProductsRepository);
    const cartBatchRepository = getCustomRepository(CartBatchRepository);
    const paymentTermsRepository = getCustomRepository(PaymentTermsRepository);
    const ppobRepository = getCustomRepository(PpobRepository);

    // services
    const healthcheckService = new HealthcheckService(getConnection());
    const categoryService = new CategoryService(categoryRepository);
    const branchService = new BranchService(branchRepository);
    const paymentCallbackService = new PaymentCallbackService();
    const outletService = new OutletService(outletRepository);
    const outletAddressService = new OutletAddressService(outletAddressRepository);
    const outletTypeService = new OutletTypeService(outletTypeRepository, userRepository, orderRepository);
    const userService = new UserService(
        userRepository,
        outletService,
        outletAddressService,
        outletTypeRepository,
        sendGrid,
        firebase,
        orderRepository
    );
    const cartService = new CartService(cartRepository, productRepository, userRepository, branchService);
    const bankAccountService = new BankAccountService(bankAccountRepository, userRepository);
    const orderService = new OrderService(
        orderRepository,
        userRepository,
        outletAddressRepository,
        shipmentRepository,
        paymentRepository,
        cartRepository,
        productRepository,
        promotionRepository,
        branchRepository,
        paymentTermsRepository
    );
    const notificationService = new NotificationService(notificationRepository);
    const productService = new ProductService(
        productRepository,
        categoryRepository,
        orderService,
        productImageRepository,
        userRepository,
        cartRepository,
        productReviewRepository
    );

    const reportService = new ReportService(orderRepository, userRepository);
    const bannerService = new BannerService(bannerRepository);
    const productReviewService = new ProductReviewService(productReviewRepository);
    const flashSaleService = new FlashSaleService(
        flashSaleRepository,
        productRepository,
        productReviewRepository,
        orderService
    );
    const newsService = new NewsService(newsRepository);
    const promotionService = new PromotionService(promotionRepository, orderRepository);
    const promotionProductService = new PromotionProductService(
        promotionProductsRepository,
        promotionRepository,
        productRepository
    );
    const cartBatchService = new CartBatchService(cartBatchRepository);
    const paymentTermsService = new PaymentTermsService(paymentTermsRepository);
    const ppobService = new PpobService(ppobRepository, orderRepository);

    // controllers
    const healthcheckController = new HealthcheckController(healthcheckService);
    const rootController = new RootController();
    const categoryController = new CategoryController(categoryService);
    const branchController = new BranchController(branchService);
    const adminCategoryController = new CategoryController(categoryService, 'ADMIN');
    const productController = new ProductController(productService);
    const paymentCallbackController = new CallbackController(paymentCallbackService, orderService, notificationService);
    const adminProductController = new ProductController(productService, 'ADMIN');
    const userController = new UserController(userService, orderService, ' ', notificationService);
    const userAdminController = new UserController(userService, orderService, 'ADMIN', notificationService);
    const outletController = new OutletController(outletService);
    const outletAddressController = new OutletAddressController(outletAddressService);
    const cartBatchController = new CartBatchController(cartBatchService);
    const cartController = new CartController(cartService);
    const bankAccountController = new BankAccountController(bankAccountService);
    const orderController = new OrderController(orderService, ' ', notificationService, ppobService, userService);
    const adminOrderController = new OrderController(
        orderService,
        'ADMIN',
        notificationService,
        ppobService,
        userService
    );
    const notificationController = new NotificationController(notificationService);
    const reportController = new ReportController(reportService);
    const bannerController = new BannerController(bannerService);
    const productReviewController = new ProductReviewController(productReviewService, '');
    const productReviewAdminController = new ProductReviewController(productReviewService, 'ADMIN');
    const flashSaleController = new FlashSaleController(flashSaleService);
    const flashSaleAdminController = new FlashSaleController(flashSaleService, 'ADMIN');
    const newsController = new NewsController(newsService);
    const outletTypeController = new OutletTypeController(outletTypeService, userService);
    const promotionController = new PromotionController(promotionService, promotionProductService, '');
    const adminPromotionController = new PromotionController(promotionService, promotionProductService, 'ADMIN');
    const paymentTermsController = new PaymentTermsController(paymentTermsService);
    const ppobController = new PpobController(ppobService, orderService, productService, cartService, userService, '');
    const ppobAdminController = new PpobController(
        ppobService,
        orderService,
        productService,
        cartService,
        userService,
        'ADMIN'
    );

    return {
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
        cartBatchController,
        paymentTermsController,
        ppobController,
        ppobAdminController
    };
}
