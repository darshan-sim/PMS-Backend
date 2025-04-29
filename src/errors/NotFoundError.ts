import { AppError } from "./AppError";
import { ErrorMessage } from "../constants/messages";
import { HttpStatus } from "../constants/httpStatusCodes";

export class NotFoundError extends AppError {
    statusCode: number;
    errors: Record<string, string>;

    constructor() {
        super(ErrorMessage.NOT_FOUND);
        this.statusCode = HttpStatus.NOT_FOUND;
        this.errors = {
            NOT_FOUND: ErrorMessage.NOT_FOUND,
        };
    }
}
