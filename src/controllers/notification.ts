/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable consistent-return */
import { Router, Response, NextFunction } from 'express';
import { INotificationService } from 'src/services/notification';
import { authentication, IRequestExtra } from './middlewares/authentication';

export class NotificationController {
    private readonly notificationService: INotificationService;

    private router: Router;

    public constructor(notificationService: INotificationService) {
        this.notificationService = notificationService;
        this.router = Router();
        this.router.use(authentication);
        this.router.get('/', this.getNotification.bind(this));
        this.router.patch('/:id', this.seenNotification.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    async getNotification(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;

            const result = await this.notificationService.findNotificationForUser(id, req.query.limit as string);
            // this.notificationService.createNotification(id, 'Testing create notifikasi');
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async seenNotification(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.notificationService.seenNotification(req.params.id);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
