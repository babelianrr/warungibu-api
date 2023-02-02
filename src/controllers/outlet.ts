/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable consistent-return */
import { Router, Response, NextFunction } from 'express';
import { IOutletService } from 'src/services/outlets';
import { adminAuthentication, authentication, IRequestExtra } from './middlewares/authentication';

export class OutletController {
    private readonly outletService: IOutletService;

    private router: Router;

    public constructor(outletService: IOutletService) {
        this.outletService = outletService;
        this.router = Router();

        this.router.use(authentication);

        this.router.get('/', this.getOutlets.bind(this));
        this.router.post('/', this.createOutlet.bind(this));
        this.router.get('/:id', this.getOutlet.bind(this));
        this.router.patch('/:id', this.updateOutlet.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    async createOutlet(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;

            if (
                req.body.name === null ||
                req.body.name === '' ||
                req.body.type === null ||
                req.body.type === '' ||
                req.body.npwp === null ||
                req.body.npwp === ''
            ) {
                res.status(500).send({ message: 'Please fill the required fields' });
                return false;
            }

            const result = await this.outletService.createOutlet(id, {
                name: req.body.name,
                type: req.body.type,
                npwp: req.body.npwp,
                telephone: req.body.telephone,
                mobile_phone: req.body.mobile_phone
            });

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOutlets(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const result = await this.outletService.getOutlet();
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOutlet(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const result = await this.outletService.getOutletById(id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateOutlet(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const result = await this.outletService.updateOutlet(id, {
                name: req.body.name,
                type: req.body.type,
                npwp: req.body.npwp,
                telephone: req.body.telephone,
                mobile_phone: req.body.mobile_phone
            });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
