import { Banners } from 'src/models/Banners';
import { EntityRepository, Repository } from 'typeorm';

export interface INotificationRepo {
    findAll(): Promise<Banners[]>;
}

@EntityRepository(Banners)
export class BannerRepository extends Repository<Banners> {
    public async findAll(): Promise<Banners[]> {
        return this.find();
    }
}
