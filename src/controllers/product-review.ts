/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable consistent-return */
import { Router, Response, NextFunction, Request } from 'express';
import { BASE_URL } from 'src/config';
import { ProductReviews } from 'src/models/Product-Reviews';
import { IBannerService } from 'src/services/banner';
import { IProductReviewService } from 'src/services/productReview';
import { adminAuthentication, authentication, IRequestExtra } from './middlewares/authentication';
import { setPrefixPath, uploadHandler } from './middlewares/handle-upload';

export class ProductReviewController {
    private readonly productReviewService: IProductReviewService;

    private router: Router;

    public constructor(productReviewService: IProductReviewService, type: string) {
        this.productReviewService = productReviewService;
        this.router = Router();
        this.router.get('/:productId', this.get.bind(this));

        if (type === 'ADMIN') {
            this.router.use(adminAuthentication);
            this.router.delete('/:id', this.delete.bind(this));
        } else {
            this.router.use(authentication);
            this.router.post('/', this.create.bind(this));
        }

        // this.router.post('/upload', setPrefixPath('banner'), uploadHandler.single('image'), this.post.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: Request, res: Response, next: NextFunction) {
        try {
            const { query, params } = req;
            const reviews = await this.productReviewService.findForProduct(params.productId, query);
            const { totalReview } = await this.productReviewService.countAll(params.productId);
            const totalPage = Math.ceil(Number(totalReview) / Number(query.limit));

            return res.status(200).json({ page: Number(query.page), totalPage, reviews });
        } catch (error) {
            next(error);
        }
    }

    public async create(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const reviewData = {
                product_id: req.body.product_id,
                order_id: req.body.order_id,
                user_id: req.user.id,
                notes: req.body.notes,
                rating: req.body.rating
            };
            const review = await this.productReviewService.create(reviewData);

            return res.status(201).json(review);
        } catch (error) {
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await this.productReviewService.delete(req.params.id);

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
