/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorCodes } from 'src/libs/errors';

import { Notifications } from 'src/models/Notifications';
import { NotificationRepository } from 'src/libs/database/repository/notification';
import { ErrorObject } from 'src/libs/error-object';
import { Banners } from 'src/models/Banners';
import { BannerRepository } from 'src/libs/database/repository/banner';

export interface IBannerService {
    findAll(): Promise<Banners[]>;
    create(image: string): Promise<Banners>;
    delete(id: string): Promise<any>;
}

export class BannerService implements IBannerService {
    private bannerRepository: BannerRepository;

    constructor(bannerRepository: BannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public async findAll(): Promise<Banners[]> {
        return this.bannerRepository.find({
            order: {
                created_at: 'DESC'
            }
        });
    }

    public async create(image: string): Promise<Banners> {
        return this.bannerRepository.save({ image });
    }

    public async delete(id: string): Promise<any> {
        return this.bannerRepository.delete(id);
    }
}
