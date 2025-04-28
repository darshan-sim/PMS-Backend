import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";

export class ValidationError extends AppError {
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    errors: Record<string, string>;

    constructor(errors: Record<string, string>) {
        super("Validation failed");
        this.errors = errors;
    }
}
