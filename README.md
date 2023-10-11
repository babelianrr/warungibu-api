# Warung Ibu - API

## Development

Prerequisite

-   VSCode
-   Node TLS (min 12)

### Start development environment

-   Create `.env` file or run `cp .env.example .env`

**Running the app locally**

-   Import tables to your database from `database` folder

-   Rename `.env.example` to `.env` then modify it.

-   Start app server

```
npm run start:dev
```

**Issues**

-   This app requires firebase secret key to run properly, please use your own firebase secret key and modify `firebase-admin-secret.json` file.
