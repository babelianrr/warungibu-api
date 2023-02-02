import { Notifications } from 'src/models/Notifications';
import { EntityRepository, Repository } from 'typeorm';

export interface INotificationRepo {
    findNotificationForUser(userId: string, limit?: string): Promise<Notifications[]>;
}

@EntityRepository(Notifications)
export class NotificationRepository extends Repository<Notifications> {
    public async findNotificationForUser(userId: string, limit?: string): Promise<Notifications[]> {
        const builder = this.createQueryBuilder('notifications')
            .innerJoinAndSelect('notifications.user', 'user')
            .leftJoinAndSelect('notifications.order', 'order')
            .leftJoinAndSelect('order.payment', 'payment')
            .where('notifications.user_id = :userId', { userId })
            .orderBy('notifications.seen')
            .addOrderBy('notifications.created_at', 'DESC');

        if (limit) {
            builder.limit(Number(limit));
        }

        return builder.getMany();
    }
}
