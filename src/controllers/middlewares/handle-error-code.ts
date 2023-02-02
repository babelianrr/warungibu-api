import { Request, NextFunction, Response } from 'express';
import { ValidationError } from 'express-openapi-validator/dist/framework/types';

import { ErrorCodeMap, ErrorCodes } from 'src/libs/errors';

export const errorHandler = () => {
    // eslint-disable-next-line
    return (err: any, req: Request, res: Response, next: NextFunction) => {
        if ((err as ValidationError).status) {
            // openapi
            console.error(err, 'Validation Error');
            return res.status(err.status).json({
                message: err.message,
                error_code: err.error_code || ErrorCodes.API_VALIDATION_ERROR,
                errors: err.errors
            });
        }

        const statusCode = ErrorCodeMap[err.errorCode];

        if (Number(statusCode)) {
            const logContext = {
                errorCode: err.errorCode,
                status_code: statusCode,
                details: err.details
            };
            console.log(err, 'error<<<');
            console.info(logContext, 'API error');

            return res.status(statusCode).send({
                errorCode: err.errorCode,
                message: err.message
            });
        }

        console.error(err, 'unexpected error');

        return res.status(500).send({
            error_code: 'SERVER_ERROR',
            message: 'Can not Proccess The Request'
        });
    };
};
