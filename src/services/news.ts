/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-await-in-loop */
import { FlashSales, FlashSaleStatuses, IFlashSaleCreateRequest } from 'src/models/flash-sales';
import { DeleteResult } from 'typeorm';
import { ErrorCodes } from 'src/libs/errors';
import { ErrorObject } from 'src/libs/error-object';
import { compareDate } from 'src/libs/helpers/date-only-comparison';
import { IProductRepo } from 'src/services/product';
import { IProductReviewRepo } from 'src/libs/database/repository/product_review';
import { INewsCreate, INewsRepo, NewsRepository } from 'src/libs/database/repository/news';
import { News } from 'src/models/news';
import { IOrderService } from './order';

export interface INewsService {
    create(news: INewsCreate): Promise<News>;
    update(updateData: any): Promise<News>;
    get(): Promise<News[]>;
    getById(id: string): Promise<News>;
    getBySlug(slug: string): Promise<News>;
    delete(id: string): Promise<DeleteResult>;
}

export class NewsService implements INewsService {
    private repository: NewsRepository;

    constructor(repository: NewsRepository) {
        this.repository = repository;
    }

    get(): Promise<News[]> {
        return this.repository.find();
    }

    async getById(id: string): Promise<News> {
        const news = await this.repository.findOne({ id });

        if (!news) {
            throw new ErrorObject(ErrorCodes.NEWS_ERROR, 'News Not Found', null);
        }

        return news;
    }

    async getBySlug(slug: string): Promise<News> {
        const news = await this.repository.findOne({ slug });

        if (!news) {
            throw new ErrorObject(ErrorCodes.NEWS_ERROR, 'News Not Found', null);
        }

        return news;
    }

    create(news: INewsCreate): Promise<News> {
        return this.repository.save({ ...news, slug: this.generateSlug(news.title) });
    }

    async update(updateData: any): Promise<News> {
        console.log('file: news.ts ~ line 47 ~ NewsService ~ update ~ updateData', updateData);
        const news = await this.repository.findOne(updateData.id);
        console.log('file: news.ts ~ line 49 ~ NewsService ~ update ~ news', news);

        if (!news) {
            throw new ErrorObject(ErrorCodes.NEWS_ERROR, 'Bertia tidak ditemukan');
        }

        const newNews = {
            ...news,
            ...updateData
        };
        newNews.slug = this.generateSlug(newNews.title);

        return this.repository.save(newNews);
    }

    async delete(id: string): Promise<DeleteResult> {
        const news = await this.repository.findOne({ id });

        if (!news) {
            throw new ErrorObject(ErrorCodes.NEWS_ERROR, 'News Not Found', null);
        }

        return this.repository.delete({ id });
    }

    // eslint-disable-next-line class-methods-use-this
    generateSlug(title: string): string {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
        return `${slug}-${new Date().getTime()}`;
    }
}
