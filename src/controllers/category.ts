/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response, NextFunction } from 'express';
import { ServerResponse } from 'http';
import { BASE_URL } from 'src/config';
import { Categories } from 'src/models/categories';
import { adminAuthentication, IRequestExtra } from './middlewares/authentication';
import { uploadHandler, setPrefixPath } from './middlewares/handle-upload';

export interface ICategoryService {
    findAll(): Promise<Categories[]>;
    findByName(name: string): Promise<Categories>;
    findById(id: string): Promise<Categories>;
    add(categorydata: any): Promise<Categories>;
    update(categorydata: any): Promise<Categories>;
    delete(id: string): Promise<any>;
}

export class CategoryController {
    private readonly categoryService: ICategoryService;

    private router: Router;

    public constructor(categoryService: ICategoryService, type?: string) {
        this.categoryService = categoryService;
        this.router = Router();

        if (type === 'ADMIN') {
            this.router.use(adminAuthentication);
            this.router.get('/', this.get.bind(this));
            this.router.post('/', this.add.bind(this));
            this.router.post(
                '/upload',
                setPrefixPath('categories'),
                uploadHandler.single('icon'),
                this.uploadImages.bind(this)
            );
            this.router.get('/:id', this.getById.bind(this));
            this.router.patch('/:id', this.update.bind(this));
            this.router.delete('/:id', this.delete.bind(this));
        } else {
            this.router.get('/', this.get.bind(this));
        }
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(_: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const categories = await this.categoryService.findAll();
            return res.status(200).json(categories);
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const categories = await this.categoryService.findById(req.params.id);

            return res.status(200).json(categories);
        } catch (err) {
            return next(err);
        }
    }

    public async add(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const category = await this.categoryService.add({
                name: req.body.name,
                icon_url: req.body.icon_url
            });

            console.log(`Admin with email: ${req.user.email} add category ${category.name}`);
            return res.status(201).json(category);
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const category = await this.categoryService.update({
                id: req.params.id,
                name: req.body.name,
                icon_url: req.body.icon_url
            });

            console.log(`Admin with email: ${req.user.email} update category ${category.name}`);
            return res.status(200).json(category);
        } catch (err) {
            return next(err);
        }
    }

    public async uploadImages(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            return res.status(200).json({ url: `${BASE_URL}/categories/${req.file.filename}` });
        } catch (err) {
            return next(err);
        }
    }

    public async delete(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            await this.categoryService.delete(req.params.id);

            console.log(`Admin with email: ${req.user.email} delete category ${req.params.id}`);

            return res.status(204).send();
        } catch (err) {
            return next(err);
        }
    }
}
