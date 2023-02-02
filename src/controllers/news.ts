/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, Request, Response, NextFunction } from 'express';
import { BASE_URL } from 'src/config';
import { INewsCreate } from 'src/libs/database/repository/news';
import { FlashSales, IFlashSaleCreateRequest } from 'src/models/flash-sales';
import { INewsService } from 'src/services/news';
import { adminAuthentication, IRequestExtra, optionalAuthentication } from './middlewares/authentication';
import { setPrefixPath, uploadHandler } from './middlewares/handle-upload';

export class NewsController {
    private readonly newsService: INewsService;

    private router: Router;

    public constructor(newsService: INewsService, type?: string) {
        this.newsService = newsService;
        this.router = Router();

        this.router.get('/', this.getNews.bind(this));
        this.router.get('/:slug', this.getNewsBySlug.bind(this));

        this.router.use(adminAuthentication);
        this.router.post('/', this.createNews.bind(this));
        this.router.post('/upload', setPrefixPath('news'), uploadHandler.single('image'), this.uploadImages.bind(this));
        this.router.put('/:id', this.update.bind(this));
        this.router.delete('/:id', this.delete.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async getNews(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.newsService.get();
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async getNewsBySlug(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.newsService.getBySlug(req.params.slug);
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async createNews(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const payload: INewsCreate = {
                user_id: req.user.id,
                content: req.body.content,
                title: req.body.title,
                image: req.body.image
            };

            const result = await this.newsService.create(payload);

            return res.status(201).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async uploadImages(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            return res.status(200).json({ url: `${BASE_URL}/news/${req.file.filename}` });
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const payload = {
                id: req.params.id,
                title: req.body.title,
                image: req.body.image,
                content: req.body.content
            };

            const result = await this.newsService.update(payload);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async delete(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            console.log(`DELETEING NEWS with ID`, req.params.id, 'EXECUTED BY ', req.user.id);
            const result = await this.newsService.delete(req.params.id);

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}
