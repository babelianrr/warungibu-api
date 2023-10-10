# Warung Ibu - API

## Development

Prerequisite

-   VSCode
-   Installed Docker
-   Node TLS (min 12)

### Start development environment

-   Create `.env` file or run `cp .env.example .env`

**Running the app locally**

-   Start the db service in Docker

```
docker-compose up -d postgres
```

-   Start app server

```
npm run start:dev
# run below if need to run migration
npm run migration:run
```

-   Shutdown development server

```
docker-compose down
```

### Create Migration

```
npm run migration:create -- -n userMigration -d src/libs/database/migrations
```

### Run Migration & Seeding

```
npm run migration:run
```

-   Seeding with dummy data

```
NODE_ENV=local npm run migration:run
```

-   Seeding product with data from DNR

```
npm run start-sync-product
```

Payment

-   Pembayaran langsung
-   Pembayaran COD
-   Pembayaran Tempo (30 Hari)

SAP

1. Mengambil data stock per productnya
    1. Detail produk
    2. Pesan
2. Mengambil seluruh data produk yang tersedia
    1. Field `valid_to` haru lebih besar dari hari ini, dianggap produk siap untuk dijual
3. Mengambil data customer,
    1. User bisa mengisi customer_id
    2. Penentuan izin apj,
4. Pembuatan order
    1. Order akan dibuat otomatis ketika pemesanan dengan tipe Pembayaran COD dan pembayaran Tempo
    2. Jika pembayaran langsung, maka proses dilakukan setelah pembayaran selesai dilakukan

Admin:

-   Superadmin
    -   Memberikan discount
-   Admin
-   User (Detail user apa aja)
