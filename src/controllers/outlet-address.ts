/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable consistent-return */
import { Router, Response, NextFunction } from 'express';
import { EAddressStatus } from 'src/models/Outlet-address';
import { IOutletAddressService } from 'src/services/outlet-address';
import { authentication, IRequestExtra } from './middlewares/authentication';

export class OutletAddressController {
    private readonly outletAddress: IOutletAddressService;

    private router: Router;

    public constructor(outletAddress: IOutletAddressService) {
        this.outletAddress = outletAddress;
        this.router = Router();
        this.router.get('/:userId/is_exist', this.getAddressByUserId.bind(this));
        this.router.use(authentication);
        this.router.get('/', this.getAddress.bind(this));
        this.router.post('/', this.createOutletAddress.bind(this));
        this.router.get('/:id', this.getAddressById.bind(this));
        this.router.patch('/:id', this.updateAddressById.bind(this));
        this.router.delete('/:id', this.deleteAddress.bind(this));
        this.router.post('/:id/set_main', this.setMainAddressById.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    async setMainAddressById(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, params } = req;
            const result = await this.outletAddress.updateAddressByUserIdAndId(user.id, params.id, {
                is_main: true
            });
            console.info({ result, user: req.user, time: new Date() });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteAddress(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, params } = req;
            const result = await this.outletAddress.updateAddressByUserIdAndId(user.id, params.id, {
                status: EAddressStatus.INACTIVE
            });
            console.info({ result, user: req.user, time: new Date() });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async createOutletAddress(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, body } = req;
            const result = await this.outletAddress.createOutletAddress({
                label: body.label,
                receiver_name: body.receiver_name,
                mobile_phone: body.mobile_phone,
                province: body.province,
                city: body.city,
                full_address: body.full_address,
                district: body.district || '',
                subdistrict: body.subdistrict || '',
                user_id: user.id,
                status: EAddressStatus.ACTIVE,
                notes: body.notes,
                postal_code: body.postal_code
            });
            console.info({ result, user: req.user, time: new Date() });
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateAddressById(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { user, body, params } = req;
            const result = await this.outletAddress.updateAddressByUserIdAndId(user.id, params.id, {
                label: body.label,
                receiver_name: body.receiver_name,
                mobile_phone: body.mobile_phone,
                province: body.province,
                city: body.city,
                full_address: body.full_address,
                district: body.district || '',
                subdistrict: body.subdistrict || '',
                status: EAddressStatus.ACTIVE,
                notes: body.notes
            });
            console.info({ result, user: req.user, time: new Date() });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAddress(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            console.log(id, 'ID');
            const result = await this.outletAddress.getAddressByUserId(id, req.query.status as EAddressStatus);
            console.info({ result, user: req.user, time: new Date() });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAddressById(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            console.log(id, 'iniiiii apaaaa?');
            const result = await this.outletAddress.getAddressByAddressId(req.params.id, id);
            console.info({ result, user: req.user, time: new Date() });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAddressByUserId(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            console.log(req.params.userId, 'INI APA?');
            const result = await this.outletAddress.getOneAddressByUserId(req.params.userId);
            console.info({ result, time: new Date() });
            return res.status(200).json({ result });
        } catch (error) {
            next(error);
        }
    }
}
