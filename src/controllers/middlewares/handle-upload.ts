/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

let prefix = '';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(req);
        cb(null, path.join(__dirname, `../../../../public/${prefix}`));
    },
    filename: (req, file, cb) => {
        const uniquePrefix = Date.now();
        cb(null, `${uniquePrefix}-${file.originalname}`);
    }
});

export const uploadHandler = multer({ storage });

export const setPrefixPath = (newPrefix: string) => (_: Request, __: Response, next: NextFunction) => {
    prefix = newPrefix;
    next();
};
