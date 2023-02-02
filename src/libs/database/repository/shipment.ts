import { EntityRepository, Repository } from 'typeorm';
import { Shipments } from 'src/models/shipments';

@EntityRepository(Shipments)
export class ShipmentRepository extends Repository<Shipments> {}
