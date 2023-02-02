import { Router, Response, NextFunction } from 'express';
import { BankAccounts, IBankAccountCreateRequest, IBankAccountUpdateRequest } from 'src/models/bank-accounts';
import { authentication, IRequestExtra } from './middlewares/authentication';

export interface IBankAccountService {
    findForUser(userId: string): Promise<BankAccounts[]>;
    findByIdForUser(userId: string, name: string): Promise<BankAccounts>;
    save(bankAccountData: IBankAccountCreateRequest): Promise<BankAccounts>;
    update(bankAccountData: IBankAccountUpdateRequest): Promise<BankAccounts>;
    softDelete(id: string, userId: string): Promise<BankAccounts>;
}

export class BankAccountController {
    private readonly bankAccountService: IBankAccountService;

    private router: Router;

    public constructor(bankAccountService: IBankAccountService) {
        this.bankAccountService = bankAccountService;
        this.router = Router();
        this.router.use(authentication);
        this.router.get('/', this.get.bind(this));
        this.router.get('/:id', this.getById.bind(this));
        this.router.post('/', this.post.bind(this));
        this.router.patch('/:id', this.update.bind(this));
        this.router.delete('/:id', this.delete.bind(this));
    }

    getRouter(): Router {
        return this.router;
    }

    public async get(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const bankAccount = await this.bankAccountService.findForUser(userId);
            return res.status(200).json(bankAccount);
        } catch (err) {
            return next(err);
        }
    }

    public async getById(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const bankAccount = await this.bankAccountService.findByIdForUser(req.params.id, userId);

            return res.status(200).json(bankAccount);
        } catch (err) {
            return next(err);
        }
    }

    public async post(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const bankAccount = await this.bankAccountService.save({
                bank_name: req.body.bank_name,
                account_name: req.body.account_name,
                account_number: req.body.account_number,
                branch_name: req.body.branch_name,
                user_id: userId
            });

            return res.status(201).json(bankAccount);
        } catch (err) {
            return next(err);
        }
    }

    public async update(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const bankAccount = await this.bankAccountService.update({
                user_id: userId,
                id: req.params.id,
                bank_name: req.body.bank_name,
                account_name: req.body.account_name,
                account_number: req.body.account_number,
                branch_name: req.body.branch_name,
                status: req.body.status
            });

            return res.status(200).json(bankAccount);
        } catch (err) {
            return next(err);
        }
    }

    public async delete(req: IRequestExtra, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = req.user.id;
            const bankAccount = await this.bankAccountService.softDelete(req.params.id, userId);

            return res.status(200).json(bankAccount);
        } catch (err) {
            return next(err);
        }
    }
}
