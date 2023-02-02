/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Router, Response, NextFunction } from 'express';
import { IOutletTypeCreate } from 'src/libs/database/repository/outlet_types';
import { IOutletTypeService } from 'src/services/outlet-type';
import { IUserService } from 'src/services/user';
import { adminAuthentication, IRequestExtra } from './middlewares/authentication';

export class OutletTypeController {
    private readonly outletTypeService: IOutletTypeService;

    private router: Router;

    private userService: IUserService;

    public constructor(outletTypeService: IOutletTypeService, userService: IUserService) {
        this.outletTypeService = outletTypeService;
        this.userService = userService;
        this.router = Router();

        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));

        this.router.use(adminAuthentication);
        this.router.post('/', this.create.bind(this));
        this.router.put('/:id', this.update.bind(this));
        this.router.delete('/:id', this.delete.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.outletTypeService.get();
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.outletTypeService.getById(req.params.id);
            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async create(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const payload: IOutletTypeCreate = {
                name: req.body.name,
                npwp: req.body.npwp,
                phone: req.body.phone,
                loan_limit: req.body.loan_limit,
                address: req.body.address
            };

            const result = await this.outletTypeService.create(payload);

            return res.status(201).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const payload = {
                id: req.params.id,
                name: req.body.name,
                npwp: req.body.npwp,
                phone: req.body.phone,
                loan_limit: req.body.loan_limit,
                address: req.body.address,
                active: req.body.active
            };

            const result = await this.outletTypeService.update(payload);

            this.userService.setUsersLoanLimit(payload.id, payload.loan_limit);

            return res.status(200).json(result);
        } catch (err) {
            return next(err);
        }
    }

    public async delete(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            await this.outletTypeService.delete(req.params.id);

            return res.status(204).send(`DELETING CLIENT with ID ${req.params.id}, EXECUTED BY ${req.user.id}`);
        } catch (err) {
            return next(err);
        }
    }
}
