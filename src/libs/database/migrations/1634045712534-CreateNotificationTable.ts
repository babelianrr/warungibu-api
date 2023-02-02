import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTable1634045712534 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notifications"
        (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "user_id" uuid NOT NULL,
            "order_id" uuid NOT NULL,
            "message" character varying NOT NULL,
            "seen" boolean NOT NULL DEFAULT false,
            FOREIGN KEY (user_id) REFERENCES "users"(id),
            FOREIGN KEY (order_id) REFERENCES "orders"(id)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notifications";`);
    }
}
