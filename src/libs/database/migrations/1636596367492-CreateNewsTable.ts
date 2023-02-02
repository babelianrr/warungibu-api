import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewsTable1636596367492 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS news
        (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "user_id" uuid NOT NULL,
            "content" text,
            "title" varchar,
            "image" varchar,
            FOREIGN KEY (user_id) REFERENCES "users"(id)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE news`);
    }
}
