/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Response, NextFunction } from 'express';
import { Carts, ICartCreateRequest, ICartUpdateRequest } from 'src/models/carts';
import { authentication, IRequestExtra } from './middlewares/authentication';

export interface ICartService {
    findForUser(userId: string): Promise<Carts[]>;
    findById(userId: string, id: string): Promise<Carts>;
    addToCart(cartData: ICartCreateRequest): Promise<Carts>;
    update(cartData: ICartUpdateRequest): Promise<Carts>;
    updateQty(quantity: number, id: string): Promise<Carts>;
    softDelete(userId: string, id: string): Promise<Carts>;
}

export class CartController {
    private readonly cartService: ICartService;

    private router: Router;

    CartService: any;

    public constructor(cartService: ICartService) {
        this.cartService = cartService;
        this.router = Router();
        this.router.use(authentication);
        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.patch('/qty/:id', this.updateQty.bind(this));
        this.router.patch('/:id', this.update.bind(this));
        this.router.delete('/:id', this.delete.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const carts = await this.cartService.findForUser(userId);
            return res.status(200).json(carts);
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const cart = await this.cartService.findById(userId, req.params.id);

            return res.status(200).json(cart);
        } catch (err) {
            return next(err);
        }
    }

    public async post(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const cart = await this.cartService.addToCart({
                product_id: req.body.product_id,
                location: req.body.location,
                quantity: req.body.quantity,
                user_id: userId
            });

            return res.status(201).json({
                id: cart.id,
                location: cart.location,
                quantity: cart.quantity,
                status: cart.status,
                final_unit_price: cart.final_unit_price,
                created: cart.created_at,
                updated: cart.updated_at,
                user_id: cart.user_id,
                product: cart.product
            });
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const cart = await this.cartService.update({
                user_id: userId,
                id: req.params.id,
                location: req.body.location,
                quantity: req.body.quantity
            });

            return res.status(200).json(cart);
        } catch (err) {
            return next(err);
        }
    }

    public async delete(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const cart = await this.cartService.softDelete(userId, req.params.id);

            return res.status(200).json(cart);
        } catch (err) {
            return next(err);
        }
    }

    public async updateQty(req: IRequestExtra, res: Response, next: NextFunction): Promise<Carts | Response | void> {
        try {
            const { id } = req.params;
            await this.cartService.updateQty(req.body.quantity, id);
            const cart = await this.cartService.findById(req.user.id, id);
            // console.log(cart);
            return res.status(200).json(cart);
        } catch (err) {
            return next(err);
        }
    }
}
