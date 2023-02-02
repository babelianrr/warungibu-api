import { EntityRepository, Repository } from 'typeorm';
import { Payments } from 'src/models/Payments';

@EntityRepository(Payments)
export class PaymentRepository extends Repository<Payments> {}
