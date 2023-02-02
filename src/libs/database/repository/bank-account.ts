import { EntityRepository, Repository } from 'typeorm';
import { BankAccounts } from 'src/models/bank-accounts';

@EntityRepository(BankAccounts)
export class BankAccountRepository extends Repository<BankAccounts> {
    findForUser(userId: string) {
        return this.createQueryBuilder('bank_account')
            .where('bank_account.user_id = :user_id', { user_id: userId })
            .andWhere('bank_account.status = :status', { status: 'ACTIVE' })
            .getMany();
    }

    findByIdForUser(id: string, userId: string) {
        return this.createQueryBuilder('bank_account')
            .where('bank_account.id = :id', { id })
            .andWhere('bank_account.user_id = :user_id', { user_id: userId })
            .getOne();
    }
}
