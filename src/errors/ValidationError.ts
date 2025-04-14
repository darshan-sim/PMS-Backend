import { AppError } from "./AppError";
import { ErrorCode } from "../constants/errorCodes";
import { HttpStatus } from "../constants/httpStatusCodes";

export class ValidationError extends AppError {
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    code = ErrorCode.VALIDATION_FAILED;
    errors: Record<string, string>;

    constructor(errors: Record<string, string>) {
        super("Validation failed");
        this.errors = errors;
    }
}
