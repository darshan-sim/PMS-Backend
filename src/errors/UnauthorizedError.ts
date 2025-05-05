import { AppError } from "./AppError";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";

export class UnauthorizedError extends AppError {
    statusCode = HttpStatus.UNAUTHORIZED;
    errors?: Record<string, string>;

    constructor(message: string = ErrorMessage.UNAUTHORIZED) {
        super(message);
        this.errors = {
            message,
        };
    }
}
