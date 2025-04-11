import { ErrorCode } from "../constants/errorCodes";

export abstract class AppError extends Error {
    abstract statusCode: number;
    abstract code: ErrorCode;
    abstract errors?: Record<string, string>;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
