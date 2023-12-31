/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-nested-ternary */
/* eslint no-process-env: "off" */
import nodemailer from 'nodemailer';

export const { NODE_ENV } = process.env;
export const PORT = process.env.PORT || '3000';

// Envvars for default database connection
export const PGDATABASE = process.env.PGDATABASE || 'test';
export const PGHOST = process.env.PGHOST || 'localhost';
export const PGPORT = Number(process.env.PGPORT) || 54320;
export const PGUSER = process.env.PGUSER || 'test';
export const PGPASSWORD = process.env.PGPASSWORD || 'test';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const JWT_SECRET = process.env.JWT_SECRET || 'test';
export const { DNR_HOST, DNR_USERNAME, DNR_PASSWORD, XENDIT_CALLBACK_VERIFICATION_TOKEN, XENDIT_SECRET_KEY } =
    process.env;
export const X_API_KEY = process.env.X_API_KEY || 'test';
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
export const DNR_APIKEY = process.env.DNR_APIKEY || 'test';

export const BASE_URL =
    NODE_ENV === 'local'
        ? process.env.BASE_URL
        : NODE_ENV === 'development'
        ? 'https://warungibu-api.development-big.com/'
        : 'https://api.warungibu.co.id/';

export const FRONTEND_BASE_URL =
    NODE_ENV === 'local'
        ? process.env.FRONTEND_BASE_URL
        : NODE_ENV === 'development'
        ? 'https://warungibu.development-big.com'
        : 'https://warungibu.co.id';

export const MAX_CART_QUANTITY = 50;

export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'support@warungibu.co.id';

export const DIGIFLAZZ_USERNAME = 'wizekagwO2Pg';

export const DIGIFLAZZ_API_KEY =
    NODE_ENV === 'local' ? process.env.DIGIFLAZZ_DEV_KEY : '1d14c462-b0b1-5d65-a8d6-88f3ce9d30f5';

export const TRANSPORTER = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});
