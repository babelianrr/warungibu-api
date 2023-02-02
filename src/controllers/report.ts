/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, Response, NextFunction } from 'express';
import { INotificationService } from 'src/services/notification';
import { IReportService } from 'src/services/report';
import { adminAuthentication, authentication, IRequestExtra } from './middlewares/authentication';

export class ReportController {
    private readonly reportService: IReportService;

    private router: Router;

    public constructor(reportService: IReportService) {
        this.reportService = reportService;
        this.router = Router();
        this.router.use(adminAuthentication);
        this.router.get('/', this.getReport.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    async getReport(req: IRequestExtra, res: Response, next: NextFunction) {
        try {
            const result = await this.reportService.generateReport();
            console.log('Report result >>', result);
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }
}
