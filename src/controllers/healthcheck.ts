import { Request, Response, Router } from 'express';

interface IHealthcheckService {
    isDBReady(): Promise<boolean>;
}

export class HealthcheckController {
    private readonly healthcheckService: IHealthcheckService;

    private router: Router;

    constructor(healthcheckService: IHealthcheckService) {
        this.healthcheckService = healthcheckService;
        this.router = Router();
        this.router.get('/liveness', HealthcheckController.getHealtcheckLiveness);
    }

    getRouter(): Router {
        return this.router;
    }

    static async getHealtcheckLiveness(_: Request, res: Response): Promise<Response> {
        return res.status(200).json({ status: 'OK' });
    }

    public async getHealthcheckReadiness(_: Request, res: Response): Promise<Response> {
        if (!(await this.healthcheckService.isDBReady())) {
            return res.status(503).json({
                status: 'Service Unavailable'
            });
        }

        return res.status(200).json({
            status: 'OK'
        });
    }
}
