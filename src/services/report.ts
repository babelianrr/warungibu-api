/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorCodes } from 'src/libs/errors';

import { Notifications } from 'src/models/Notifications';
import { NotificationRepository } from 'src/libs/database/repository/notification';
import { ErrorObject } from 'src/libs/error-object';
import { OrderRepository } from 'src/libs/database/repository/order';
import { UserRepository } from 'src/libs/database/repository/user';

export interface IReport {
    active_user: number;
    total_sales: number;
    total_transaction: number;
}

export interface IReportService {
    generateReport(): Promise<IReport>;
}

export class ReportService implements IReportService {
    private readonly orderRepository: OrderRepository;

    private readonly userRepository: UserRepository;

    constructor(orderRepository: OrderRepository, userRepository: UserRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public async generateReport() {
        const { totalUser } = await this.userRepository.countActiveUser();

        const { totalTransaction } = await this.orderRepository.countTotalTransaction();

        const { totalSales } = await this.orderRepository.sumTotalSales();

        return {
            active_user: Number(totalUser),
            total_sales: Number(totalTransaction),
            total_transaction: Number(totalSales)
        };
    }
}
