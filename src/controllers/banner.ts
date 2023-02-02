/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable consistent-return */
import { Router, Response, NextFunction, Request } from 'express';
import { BASE_URL } from 'src/config';
import { IBannerService } from 'src/services/banner';
import { adminAuthentication } from './middlewares/authentication';
import { setPrefixPath, uploadHandler } from './middlewares/handle-upload';

export class BannerController {
    private readonly bannerService: IBannerService;

    private router: Router;

    public constructor(bannerService: IBannerService) {
        this.bannerService = bannerService;
        this.router = Router();
        this.router.get('/', this.get.bind(this));
        this.router.post('/upload', setPrefixPath('banner'), uploadHandler.single('image'), this.post.bind(this));
        this.router.use(adminAuthentication);
        this.router.delete('/:id', this.delete.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: Request, res: Response, next: NextFunction) {
        try {
            const banners = await this.bannerService.findAll();

            return res.status(200).json(banners);
        } catch (error) {
            next(error);
        }
    }

    public async post(req: Request, res: Response, next: NextFunction) {
        try {
            const image = `${BASE_URL}/banner/${req.file.filename}`;
            const banner = await this.bannerService.create(image);

            return res.status(201).json(banner);
        } catch (error) {
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await this.bannerService.delete(req.params.id);

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
