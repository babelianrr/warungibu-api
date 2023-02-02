import { ErrorCodes } from 'src/libs/errors';

import { Notifications } from 'src/models/Notifications';
import { NotificationRepository } from 'src/libs/database/repository/notification';
import { ErrorObject } from 'src/libs/error-object';

export interface INotificationService {
    findNotificationForUser(userId: string, limit?: string): Promise<Notifications[]>;
    seenNotification(id: string): Promise<Notifications>;
    createNotification(userId: string, message: string, orderId?: string): Promise<Notifications>;
}

export class NotificationService implements INotificationService {
    private notificationRepository: NotificationRepository;

    constructor(notificationRepository: NotificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public async findNotificationForUser(userId: string, limit?: string): Promise<Notifications[]> {
        try {
            const notifications = await this.notificationRepository.findNotificationForUser(userId, limit);

            return notifications;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async seenNotification(id: string): Promise<Notifications> {
        try {
            const notification = await this.notificationRepository.findOne(id);

            if (!notification) {
                throw new ErrorObject(ErrorCodes.NOTIFICATION_NOT_FOUND_ERROR, ErrorCodes.NOTIFICATION_NOT_FOUND_ERROR);
            }

            notification.seen = true;
            await this.notificationRepository.save(notification);
            return notification;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public async createNotification(userId: string, message: string, orderId?: string): Promise<Notifications> {
        // try {
        const notification = await this.notificationRepository.save({
            user_id: userId,
            message,
            order_id: orderId
        });
        return notification;
        // } catch (error) {
        //     throw error;
        // }
    }
}
