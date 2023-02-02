/* eslint no-process-env: "off" */

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

export const BASE_URL = process.env.BASE_URL || 'https://bicart-backend.development-big.com';

export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'https://bicart.development-big.com';

export const MAX_CART_QUANTITY = 50;

export const SENDER_EMAIL = 'support@dnrplus.com';

export const DIGIFLAZZ_USERNAME = 'wizekagwO2Pg';

export const DIGIFLAZZ_API_KEY = 'dev-d71c09d0-84d6-11ed-bdd1-df360bd754b8';
