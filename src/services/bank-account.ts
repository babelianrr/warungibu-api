/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-throw-literal */
import {
    BankAccounts,
    IBankAccountCreateRequest,
    IBankAccountUpdateRequest,
    BankAccountStatuses
} from 'src/models/bank-accounts';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { IUserRepo } from 'src/libs/database/repository/user';

interface IBankAccountRepo {
    find(): Promise<BankAccounts[]>;
    findForUser(userId: string): Promise<BankAccounts[]>;
    findOne(id: string): Promise<BankAccounts>;
    create(bankAccountData: any): BankAccounts;
    save(bankAccount: BankAccounts): Promise<BankAccounts>;
    findByIdForUser(id: string, userId: string): Promise<BankAccounts>;
}

export class BankAccountService {
    private repository: IBankAccountRepo;

    private userRepository: IUserRepo;

    constructor(repository: IBankAccountRepo, ur: IUserRepo) {
        this.repository = repository;
        this.userRepository = ur;
    }

    public async findForUser(userId: string): Promise<BankAccounts[]> {
        return this.repository.findForUser(userId);
    }

    public async findByIdForUser(id: string, userId: string): Promise<BankAccounts> {
        const bankAccount = await this.repository.findByIdForUser(id, userId);

        if (!bankAccount) {
            throw new ErrorObject(ErrorCodes.BANK_ACCOUNT_NOT_FOUND_ERROR, 'Rekening pembayaran tidak ditemukan');
        }

        return bankAccount;
    }

    public async save(bankAccountData: IBankAccountCreateRequest): Promise<BankAccounts> {
        const user = await this.userRepository.findOne(bankAccountData.user_id);

        if (!user) {
            throw new ErrorObject(ErrorCodes.USER_NOT_FOUND_ERROR, 'Akun tidak ditemukan');
        }

        const newBaData = {
            ...bankAccountData,
            status: BankAccountStatuses.ACTIVE
        };
        const newBa = this.repository.create(newBaData);
        return this.repository.save(newBa);
    }

    public async update(bankAccountData: IBankAccountUpdateRequest): Promise<BankAccounts> {
        const bankAccount = await this.repository.findByIdForUser(bankAccountData.id, bankAccountData.user_id);

        if (!bankAccount) {
            throw new ErrorObject(ErrorCodes.BANK_ACCOUNT_NOT_FOUND_ERROR, 'Rekening pembayaran tidak ditemukan');
        }

        const updatedBa = {
            id: bankAccount.id,
            user_id: bankAccount.user_id,
            bank_name: bankAccountData.bank_name ? bankAccountData.bank_name : bankAccount.bank_name,
            account_name: bankAccountData.account_name ? bankAccountData.account_name : bankAccount.account_name,
            account_number: bankAccountData.account_number
                ? bankAccountData.account_number
                : bankAccount.account_number,
            branch_name: bankAccountData.branch_name ? bankAccountData.branch_name : bankAccount.branch_name,
            status: bankAccount.status,
            user: bankAccount.user,
            created_at: bankAccount.created_at,
            updated_at: bankAccount.updated_at,
            deleted_at: bankAccount.updated_at
        };

        return this.repository.save(updatedBa);
    }

    public async softDelete(id: string, userId: string): Promise<BankAccounts> {
        const bankAccount = await this.repository.findByIdForUser(id, userId);

        if (!bankAccount) {
            throw new ErrorObject(ErrorCodes.BANK_ACCOUNT_NOT_FOUND_ERROR, 'Rekening pembayaran tidak ditemukan');
        }

        const deletedBa = {
            ...bankAccount,
            status: 'INACTIVE',
            deleted_at: new Date().toISOString()
        };
        return this.repository.save(deletedBa);
    }
}
