/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-nested-ternary */
/* eslint no-process-env: "off" */
import nodemailer from 'nodemailer';

export const { NODE_ENV } = process.env;
export const PORT = process.env.PORT || '3000';

// Env vars for default database connection
export const PGDATABASE = process.env.PGDATABASE || 'warungibu';
export const PGHOST = process.env.PGHOST || 'localhost';
export const PGPORT = Number(process.env.PGPORT) || 5432;
export const PGUSER = process.env.PGUSER || 'postgres';
export const PGPASSWORD = process.env.PGPASSWORD || 'admin';
export const JWT_SECRET = process.env.JWT_SECRET || 'test';

export const {
    DNR_HOST,
    DNR_USERNAME,
    DNR_PASSWORD,
    SENDER_EMAIL,
    BASE_URL,
    FRONTEND_BASE_URL,
    DIGIFLAZZ_USERNAME,
    DIGIFLAZZ_API_KEY
} = process.env;

export const MAX_CART_QUANTITY = 50;

export const TRANSPORTER = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});
