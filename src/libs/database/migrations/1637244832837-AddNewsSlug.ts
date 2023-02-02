import { MigrationInterface, QueryRunner } from 'typeorm';
import { News } from 'src/models/news';

export class AddNewsSlug1637244832837 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        function generateSlug(title: string): string {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/-+/g, '-'); // collapse dashes
            return `${slug}-${new Date().getTime()}`;
        }
        await queryRunner.query(`
        ALTER TABLE news ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
        `);

        const allNews = await queryRunner.manager.find(News);

        for (let i = 0; i < allNews.length; i += 1) {
            const news = allNews[i];

            news.slug = generateSlug(news.title);

            await queryRunner.manager.save(news);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE news DROP COLUMN slug VARCHAR(100);
        `);
    }
}
