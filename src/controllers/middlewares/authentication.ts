/* eslint-disable no-param-reassign */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorObject } from 'src/libs/error-object';
import { ErrorCodes } from 'src/libs/errors';
import { DNR_APIKEY, JWT_SECRET } from 'src/config';
import { ERoleStatus } from 'src/models/Users';

export interface IRequestExtra extends Request {
    user?: {
        id?: string;
        email?: string;
        role?: string;
    };
}

function checkAPIKeyForSAP(apiKey: string) {
    return apiKey === DNR_APIKEY;
}

export async function authentication(_: any, res: Response, next: NextFunction) {
    const apiKey = _.get('x-auth-token');
    try {
        /**
         * jwt from generateJWTTokenUser consist of:
         * email: string
         * id: string
         */
        const data: any = jwt.verify(apiKey, JWT_SECRET);
        _.user = data.data;
        if (_.user.role === ERoleStatus.INACTIVE_ADMIN) {
            next(new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login as admin', null));
        }
        next();
    } catch (error) {
        console.log(error);
        next(new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login', error));
    }
}

export async function adminAuthentication(_: any, res: Response, next: NextFunction) {
    const apiKey = _.get('x-auth-token');
    try {
        if (checkAPIKeyForSAP(apiKey)) {
            _.user = {
                id: 'SAP',
                email: 'SAP'
            };
            next();
        } else {
            /**
             * jwt from generateJWTTokenUser consist of:
             * email: string
             * id: string
             * role: string
             */
            const data: any = jwt.verify(apiKey, JWT_SECRET);
            _.user = data.data;

            if (![ERoleStatus.ADMIN, ERoleStatus.SUPER_ADMIN].includes(_.user.role)) {
                next(new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login as admin', null));
            }

            next();
        }
    } catch (error) {
        console.log(error);
        next(new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login', error));
    }
}

export async function optionalAuthentication(_: any, res: Response, next: NextFunction) {
    const apiKey = _.get('x-auth-token');
    if (apiKey) {
        try {
            const data: any = jwt.verify(apiKey, JWT_SECRET);
            _.user = data.data;
            next();
        } catch (error) {
            console.log(error);
            next(new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login', error));
        }
    } else {
        next();
    }
}

export async function superAdminAuth(_: any, res: Response, next: NextFunction) {
    const apiKey = _.get('x-auth-token');
    try {
        /**
         * jwt from generateJWTTokenUser consist of:
         * email: string
         * id: string
         * role: string
         */
        const data: any = jwt.verify(apiKey, JWT_SECRET);
        _.user = data.data;
        console.log('file: authentication.ts ~ line 98 ~ superAdminAuth ~ user', _.user, _.body);

        if ((_.body.discount_percentage || _.body.discount_price) && _.user.role !== ERoleStatus.SUPER_ADMIN) {
            next(new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Only super admin can update discount', null));
            return;
        }

        next();
    } catch (error) {
        console.log(error);
        next(new ErrorObject(ErrorCodes.UNAUTHORIZED_USER, 'Please login', error));
    }
}
