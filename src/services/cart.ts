/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-throw-literal */
import { Carts, ICartCreateRequest, ICartUpdateRequest, CartStatuses } from 'src/models/carts';
import { ERoleStatus } from 'src/models/Users';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { IUserRepo } from 'src/libs/database/repository/user';
import { IProductRepo } from 'src/services/product';
import { ProductStatuses } from 'src/models/products';
import { MAX_CART_QUANTITY } from 'src/config';
import { IPpobRepo } from 'src/libs/database/repository/ppob';
import { BranchService } from './branch';

export interface ICartRepo {
    find(): Promise<Carts[]>;
    findOneInvoiceCart(cartId: string, orderId: string): Promise<Carts>;
    findOrderedCartByOrderId(orderId: string): Promise<Carts[]>;
    findOne(cartId: string): Promise<Carts>;
    findForUser(userId: string): Promise<Carts[]>;
    findOneForUser(userId: string, id: string): Promise<Carts>;
    create(cartData: any): Carts;
    save(cart: Carts): Promise<Carts>;
    findExistingCart(product_id: string, user_id: string, location: string): Promise<Carts>;
    findExistingInvoiceCart(product_id: string, order_id: string, location: string): Promise<Carts>;
    findCompleteCartsByProductForToday(user_id: string, product_id: string): Promise<Carts[]>;
    findAllCompleteCartsByProduct(product_id: string): Promise<Carts[]>;
    sumAllCompleteCartsByProduct(product_ids: string[]): Promise<any>;
    query(query: string): Promise<Carts>;
}

export class CartService {
    private repository: ICartRepo;

    private productRepository: IProductRepo;

    private userRepository: IUserRepo;

    private branchService: BranchService;

    constructor(repository: ICartRepo, pr: IProductRepo, ur: IUserRepo, bs: BranchService) {
        this.repository = repository;
        this.productRepository = pr;
        this.userRepository = ur;
        this.branchService = bs;
    }

    public async findAll(): Promise<Carts[]> {
        return this.repository.find();
    }

    public async findForUser(userId: string): Promise<Carts[]> {
        const carts = await this.repository.findForUser(userId);
        for (let i = 0; i < carts.length; i += 1) {
            let updatedPrice = 0;
            // carts[i].final_unit_price = carts[i].quantity * (carts[i].product.price - carts[i].product.discount_price);
            // carts[i].unit_price = carts[i].product.price;
            // carts[i].discount_percentage = carts[i].product.discount_percentage;

            const promotions = await this.productRepository.findPromotionForProductById(carts[i].product.id);
            const branch = await this.branchService.findStockByProductSku(carts[i].product.sku_number);
            console.log(`stock = ${branch.stock}`);
            carts[i].product.promotions = promotions;
            carts[i].product.stock = branch.stock;
            if (!promotions && carts[i].discount_percentage > 0) {
                const updatedCart = {
                    ...carts[i],
                    final_unit_price: carts[i].quantity * carts[i].product.price,
                    discount_percentage: 0
                };

                // eslint-disable-next-line no-await-in-loop
                await this.repository.save(updatedCart);

                updatedPrice = 1;
            }
            carts[i].updated_price = updatedPrice;
        }

        return carts;
    }

    public async findById(userId: string, id: string): Promise<Carts> {
        const cart = await this.repository.findOneForUser(userId, id);

        if (!cart) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak ditemukan');
        }

        // cart.final_unit_price = cart.quantity * (cart.product.price - cart.product.discount_price);
        // cart.unit_price = cart.product.price;
        // cart.discount_percentage = cart.product.discount_percentage;

        return cart;
    }

    public async addToCart(cartData: ICartCreateRequest): Promise<Carts> {
        if (cartData.quantity > MAX_CART_QUANTITY) {
            throw new ErrorObject(
                ErrorCodes.ADD_TO_CART_ERROR,
                `Maks ${MAX_CART_QUANTITY} item per produk dalam keranjang`
            );
        }

        const product = await this.productRepository.findOne(cartData.product_id);
        const user = await this.userRepository.findOne(cartData.user_id);

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

        console.log(product);

        const existingCart = await this.repository.findExistingCart(
            cartData.product_id,
            cartData.user_id,
            cartData.location
        );
        let resultCart;

        if (!existingCart) {
            const promoDiscount = await this.tieredPromotionFinalUnitPrice(product, cartData.quantity);
            const finalUnitPrice =
                cartData.quantity * (product.price - Math.ceil(product.price * (promoDiscount / 100)));
            const newCartData = {
                ...cartData,
                status: CartStatuses.ACTIVE,
                final_unit_price: finalUnitPrice,
                unit_price: product.price,
                // discount_percentage: product.discount_percentage,
                discount_percentage: promoDiscount,
                product
            };

            resultCart = this.repository.create(newCartData);
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

        return this.repository.save(resultCart);
    }

    public async update(cartData: ICartUpdateRequest): Promise<Carts> {
        if (cartData.quantity > MAX_CART_QUANTITY) {
            throw new ErrorObject(
                ErrorCodes.ADD_TO_CART_ERROR,
                `Maks ${MAX_CART_QUANTITY} item per produk dalam keranjang`
            );
        }

        const cart = await this.repository.findOneForUser(cartData.user_id, cartData.id);

        console.log(cart);

        if (!cart) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak ditemukan');
        }

        if (cart.status !== CartStatuses.ACTIVE) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak aktif');
        }

        const product = await this.productRepository.findOne(cart.product.id);
        const promoDiscount = await this.tieredPromotionFinalUnitPrice(product, cartData.quantity);
        console.log(`DISCOUNT PERCENTAGE : ${promoDiscount}`);

        const updatedCart = {
            ...cart,
            location: cartData.location,
            quantity: cartData.quantity,
            final_unit_price:
                cartData.quantity * (cart.product.price - Math.ceil(product.price * (promoDiscount / 100))),
            unit_price: cart.product.price,
            // discount_percentage: cart.product.discount_percentage
            discount_percentage: promoDiscount
        };

        return this.repository.save(updatedCart);
    }

    public async softDelete(userId: string, id: string): Promise<Carts> {
        const cart = await this.repository.findOneForUser(userId, id);

        if (!cart) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak ditemukan');
        }

        if (cart.status !== CartStatuses.ACTIVE) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak aktif');
        }

        const deletedCart = {
            ...cart,
            status: CartStatuses.DELETED
        };

        return this.repository.save(deletedCart);
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

    public async updateQty(quantity: number, id: string): Promise<Carts> {
        const cart = await this.repository.findOne(id);

        console.log(cart);

        if (!cart) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak ditemukan');
        }

        if (cart.status !== CartStatuses.ACTIVE) {
            throw new ErrorObject(ErrorCodes.CART_NOT_FOUND_ERROR, 'Keranjang tidak aktif');
        }

        const query = `UPDATE public.carts SET quantity = ${quantity} WHERE id = '${id}'`;

        return this.repository.query(query);
    }
}
