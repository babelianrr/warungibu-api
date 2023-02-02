/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${process.cwd()}/public/tmp`); // file storage location
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname.replace(/\s/g, '')}`);
    }
});

export const uploadHandlerExcel = multer({ storage });
