/* eslint-disable @typescript-eslint/ban-types */
export class ErrorObject extends Error {
    public errorCode: string;

    public details?: object | null;

    constructor(errorCode: string, message: string, details?: object | null) {
        super(message);
        this.name = this.constructor.name;
        this.errorCode = errorCode;
        this.details = details;
    }
}
