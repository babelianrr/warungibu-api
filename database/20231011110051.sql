/*
PostgreSQL Backup
Database: db_bcart/public
Backup Time: 2023-10-11 11:01:13
*/

DROP TABLE IF EXISTS "public"."branches";
DROP TABLE IF EXISTS "public"."banners";
DROP TABLE IF EXISTS "public"."carts";
DROP TABLE IF EXISTS "public"."categories";
DROP TABLE IF EXISTS "public"."flash_sales";
DROP TABLE IF EXISTS "public"."news";
DROP TABLE IF EXISTS "public"."notifications";
DROP TABLE IF EXISTS "public"."orders";
DROP TABLE IF EXISTS "public"."outlet_types";
DROP TABLE IF EXISTS "public"."payments";
DROP TABLE IF EXISTS "public"."ppob";
DROP TABLE IF EXISTS "public"."product_favorites";
DROP TABLE IF EXISTS "public"."product_flash_sales";
DROP TABLE IF EXISTS "public"."product_images";
DROP TABLE IF EXISTS "public"."product_reviews";
DROP TABLE IF EXISTS "public"."products";
DROP TABLE IF EXISTS "public"."products_categories";
DROP TABLE IF EXISTS "public"."promotions";
DROP TABLE IF EXISTS "public"."promotions_products";
DROP TABLE IF EXISTS "public"."shipments";
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "branches" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "branch_code" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "stock" int4 NOT NULL,
  "location" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "product_sku" varchar COLLATE "pg_catalog"."default" NOT NULL
)
;
CREATE TABLE "banners" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "image" varchar COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "banners" OWNER TO "dev";
CREATE TABLE "carts" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "quantity" int4 NOT NULL,
  "location" varchar COLLATE "pg_catalog"."default",
  "final_unit_price" int4 NOT NULL,
  "status" varchar COLLATE "pg_catalog"."default",
  "product_id" uuid,
  "user_id" uuid NOT NULL,
  "order_id" uuid,
  "discount_percentage" float4,
  "unit_price" int4,
  "ppob_id" uuid
)
;
ALTER TABLE "carts" OWNER TO "dev";
CREATE TABLE "categories" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "name" varchar(40) COLLATE "pg_catalog"."default" NOT NULL,
  "icon_url" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "categories" OWNER TO "dev";
CREATE TABLE "flash_sales" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "notes" varchar COLLATE "pg_catalog"."default",
  "start_date" timestamptz(6) NOT NULL,
  "status" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "end_date" timestamptz(6) NOT NULL
)
;
ALTER TABLE "flash_sales" OWNER TO "dev";
CREATE TABLE "news" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "user_id" uuid NOT NULL,
  "content" text COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "image" varchar COLLATE "pg_catalog"."default",
  "slug" varchar(100) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "news" OWNER TO "dev";
CREATE TABLE "notifications" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "user_id" uuid NOT NULL,
  "order_id" uuid,
  "message" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "seen" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "notifications" OWNER TO "dev";
CREATE TABLE "orders" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "status" varchar COLLATE "pg_catalog"."default",
  "expired_at" timestamptz(6),
  "user_id" uuid NOT NULL,
  "payment_id" uuid,
  "shipment_id" uuid,
  "transaction_number" varchar COLLATE "pg_catalog"."default",
  "order_events" jsonb,
  "completion_deadline" timestamptz(6)
)
;
ALTER TABLE "orders" OWNER TO "dev";
CREATE TABLE "outlet_types" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "name" varchar COLLATE "pg_catalog"."default",
  "npwp" varchar(255) COLLATE "pg_catalog"."default",
  "phone" varchar(255) COLLATE "pg_catalog"."default",
  "loan_limit" int4,
  "address" text COLLATE "pg_catalog"."default",
  "active" bool DEFAULT true
)
;
ALTER TABLE "outlet_types" OWNER TO "dev";
CREATE TABLE "payments" (
  "id" uuid NOT NULL,
  "method" varchar COLLATE "pg_catalog"."default",
  "channel" varchar COLLATE "pg_catalog"."default",
  "product_price" int4 NOT NULL,
  "reference_number" varchar COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "events" jsonb NOT NULL,
  "created" timestamptz(6) NOT NULL DEFAULT now(),
  "updated" timestamptz(6) NOT NULL DEFAULT now(),
  "shipment_fee" int4 NOT NULL DEFAULT 0,
  "tax" int4 NOT NULL,
  "order_discount" int4 NOT NULL DEFAULT 0,
  "unique_amount" int4 NOT NULL DEFAULT 0,
  "channel_fee" int4 NOT NULL DEFAULT 0,
  "total_amount" int4 NOT NULL DEFAULT 0,
  "account_name" varchar COLLATE "pg_catalog"."default",
  "account_number" varchar COLLATE "pg_catalog"."default",
  "refund_amount" int4,
  "account_bank" varchar(100) COLLATE "pg_catalog"."default",
  "type" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "payment_reference_number" varchar COLLATE "pg_catalog"."default",
  "promotion_code" varchar COLLATE "pg_catalog"."default",
  "promotion_discount" int4,
  "payment_date" date,
  "invoice_no" varchar COLLATE "pg_catalog"."default",
  "invoice_date" timestamptz(6) DEFAULT now(),
  "days_due" int4
)
;
ALTER TABLE "payments" OWNER TO "dev";
CREATE TABLE "ppob" (
  "id" uuid NOT NULL,
  "product_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "category" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "brand" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "type" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "seller_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "price" int4 NOT NULL,
  "sell_price" int4 NOT NULL,
  "buyer_sku_code" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "buyer_product_status" bool NOT NULL,
  "seller_product_status" bool NOT NULL,
  "unlimited_stock" bool NOT NULL,
  "stock" int4 NOT NULL,
  "multi" bool NOT NULL,
  "start_cut_off" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "end_cut_off" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "desc" text COLLATE "pg_catalog"."default" NOT NULL,
  "active" bool NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "ppob" OWNER TO "dev";
CREATE TABLE "product_favorites" (
  "product_id" uuid NOT NULL,
  "user_id" uuid NOT NULL
)
;
ALTER TABLE "product_favorites" OWNER TO "dev";
CREATE TABLE "product_flash_sales" (
  "product_id" uuid NOT NULL,
  "flash_sale_id" uuid NOT NULL
)
;
ALTER TABLE "product_flash_sales" OWNER TO "dev";
CREATE TABLE "product_images" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "url" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "product_id" uuid
)
;
ALTER TABLE "product_images" OWNER TO "dev";
CREATE TABLE "product_reviews" (
  "id" uuid NOT NULL,
  "rating" int4 NOT NULL,
  "notes" varchar COLLATE "pg_catalog"."default",
  "product_id" uuid,
  "user_id" uuid,
  "order_id" uuid,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "product_reviews" OWNER TO "dev";
CREATE TABLE "products" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "name" varchar(80) COLLATE "pg_catalog"."default" NOT NULL,
  "picture_url" varchar COLLATE "pg_catalog"."default",
  "sku_number" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "company_name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "unit" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "price" int4 NOT NULL,
  "discount_price" int4,
  "discount_percentage" int4,
  "discount_type" varchar COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "valid_to" timestamptz(6),
  "product_type" varchar(100) COLLATE "pg_catalog"."default",
  "dpf" varchar COLLATE "pg_catalog"."default",
  "discount_end_date" timestamptz(6),
  "sap_price" int4
)
;
ALTER TABLE "products" OWNER TO "dev";
CREATE TABLE "products_categories" (
  "product_id" uuid NOT NULL,
  "category_id" uuid NOT NULL
)
;
ALTER TABLE "products_categories" OWNER TO "dev";
CREATE TABLE "promotions" (
  "id" uuid NOT NULL,
  "code" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "start_date" date,
  "end_date" date,
  "status" varchar COLLATE "pg_catalog"."default" DEFAULT 'ACTIVE'::character varying,
  "type" varchar COLLATE "pg_catalog"."default",
  "max_usage_promo" int4 DEFAULT 0,
  "max_usage_user" int4 DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "min_purchase" int4 DEFAULT 0,
  "discount_percentage" numeric DEFAULT 0,
  "max_discount_amount" int4
)
;
ALTER TABLE "promotions" OWNER TO "dev";
CREATE TABLE "promotions_products" (
  "id" uuid NOT NULL,
  "promotion_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "percentage" numeric DEFAULT 0.00,
  "qty_max" int4 DEFAULT 0,
  "qty_min" int4 DEFAULT 0,
  "status" varchar COLLATE "pg_catalog"."default" DEFAULT 'ACTIVE'::character varying,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "promotions_products" OWNER TO "dev";
CREATE TABLE "shipments" (
  "id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "courier" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "track_number" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "delivery_date" timestamptz(6),
  "receive_date" timestamptz(6),
  "receiver_name" varchar COLLATE "pg_catalog"."default",
  "location" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "price" int4 NOT NULL,
  "outlet_address_id" uuid,
  "outlet_types_id" uuid
)
;
ALTER TABLE "shipments" OWNER TO "dev";
CREATE TABLE "users" (
  "id" uuid NOT NULL,
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar COLLATE "pg_catalog"."default",
  "ktp" varchar COLLATE "pg_catalog"."default",
  "user_address" text COLLATE "pg_catalog"."default",
  "gender" varchar COLLATE "pg_catalog"."default",
  "phone_number" varchar COLLATE "pg_catalog"."default",
  "role_status" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "login_provider" varchar COLLATE "pg_catalog"."default",
  "photo_url" varchar COLLATE "pg_catalog"."default",
  "created" timestamptz(6) NOT NULL DEFAULT now(),
  "updated" timestamptz(6) NOT NULL DEFAULT now(),
  "verification_token" varchar(60) COLLATE "pg_catalog"."default",
  "noref_dplus" varchar COLLATE "pg_catalog"."default",
  "loan_level" int4,
  "reset_password_token" varchar COLLATE "pg_catalog"."default",
  "reset_password_expired_at" timestamptz(6),
  "customer_id" SERIAL NOT NULL,
  "npwp" varchar(255) COLLATE "pg_catalog"."default",
  "client_phone" varchar(255) COLLATE "pg_catalog"."default",
  "loan_limit" int4,
  "outlet_types_id" uuid,
  "pin" varchar(255) COLLATE "pg_catalog"."default",
  "reset_pin_token" varchar(255) COLLATE "pg_catalog"."default",
  "reset_pin_expired_at" timestamptz(6)
)
;
ALTER TABLE "users" OWNER TO "dev";
BEGIN;
LOCK TABLE "public"."banners" IN SHARE MODE;
DELETE FROM "public"."banners";
COMMIT;
BEGIN;
LOCK TABLE "public"."carts" IN SHARE MODE;
DELETE FROM "public"."carts";
COMMIT;
BEGIN;
LOCK TABLE "public"."categories" IN SHARE MODE;
DELETE FROM "public"."categories";
COMMIT;
BEGIN;
LOCK TABLE "public"."flash_sales" IN SHARE MODE;
DELETE FROM "public"."flash_sales";
COMMIT;
BEGIN;
LOCK TABLE "public"."news" IN SHARE MODE;
DELETE FROM "public"."news";
COMMIT;
BEGIN;
LOCK TABLE "public"."notifications" IN SHARE MODE;
DELETE FROM "public"."notifications";
COMMIT;
BEGIN;
LOCK TABLE "public"."orders" IN SHARE MODE;
DELETE FROM "public"."orders";
COMMIT;
BEGIN;
LOCK TABLE "public"."outlet_types" IN SHARE MODE;
DELETE FROM "public"."outlet_types";
COMMIT;
BEGIN;
LOCK TABLE "public"."payments" IN SHARE MODE;
DELETE FROM "public"."payments";
COMMIT;
BEGIN;
LOCK TABLE "public"."ppob" IN SHARE MODE;
DELETE FROM "public"."ppob";
COMMIT;
BEGIN;
LOCK TABLE "public"."product_favorites" IN SHARE MODE;
DELETE FROM "public"."product_favorites";
COMMIT;
BEGIN;
LOCK TABLE "public"."product_flash_sales" IN SHARE MODE;
DELETE FROM "public"."product_flash_sales";
COMMIT;
BEGIN;
LOCK TABLE "public"."product_images" IN SHARE MODE;
DELETE FROM "public"."product_images";
COMMIT;
BEGIN;
LOCK TABLE "public"."product_reviews" IN SHARE MODE;
DELETE FROM "public"."product_reviews";
COMMIT;
BEGIN;
LOCK TABLE "public"."products" IN SHARE MODE;
DELETE FROM "public"."products";
COMMIT;
BEGIN;
LOCK TABLE "public"."products_categories" IN SHARE MODE;
DELETE FROM "public"."products_categories";
COMMIT;
BEGIN;
LOCK TABLE "public"."promotions" IN SHARE MODE;
DELETE FROM "public"."promotions";
COMMIT;
BEGIN;
LOCK TABLE "public"."promotions_products" IN SHARE MODE;
DELETE FROM "public"."promotions_products";
COMMIT;
BEGIN;
LOCK TABLE "public"."shipments" IN SHARE MODE;
DELETE FROM "public"."shipments";
COMMIT;
BEGIN;
LOCK TABLE "public"."users" IN SHARE MODE;
DELETE FROM "public"."users";
INSERT INTO "public"."users" ("id","name","email","password","ktp","user_address","gender","phone_number","role_status","login_provider","photo_url","created","updated","verification_token","noref_dplus","loan_level","reset_password_token","reset_password_expired_at","customer_id","npwp","client_phone","loan_limit","outlet_types_id","pin","reset_pin_token","reset_pin_expired_at") VALUES ('b9f46334-e02d-4437-8419-5ae9e5245337', 'Super Admin', 'admin@warungibu.dev', '$2b$10$oktiuCET56CUEn9adjpjAe2cHMDMb.WDN0YCLULp3qyuhVWj.PjvC', NULL, NULL, NULL, NULL, 'SUPER_ADMIN', NULL, NULL, '2023-01-30 14:47:38+07', '2023-01-30 13:36:39+07', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
COMMIT;
ALTER TABLE "ppob" ADD CONSTRAINT "ppob_pkey" PRIMARY KEY ("id");
ALTER TABLE "ppob" ADD CONSTRAINT "ppob_buyer_sku_code_key" UNIQUE ("buyer_sku_code");
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_key" UNIQUE ("phone_number");
