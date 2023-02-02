import { News } from 'src/models/news';
import { EntityRepository, Repository, Brackets } from 'typeorm';

export interface INewsRepo {}

export interface INewsCreate {
    title: string;
    user_id: string;
    image: string;
    content: string;
}

@EntityRepository(News)
export class NewsRepository extends Repository<News> {}
