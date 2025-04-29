import { HttpStatus } from "../constants/httpStatusCodes";
import { AppError } from "./AppError";
import { ErrorMessage } from "../constants/messages";

export class InternalServerError extends AppError {
    errors?: Record<string, string> | undefined;
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    constructor(private error: Error) {
        super(ErrorMessage.INTERNAL_ERROR);
        if (process.env.NODE_ENV === "development") {
            this.errors = {
                stack: this.error.stack || "No stack available",
            };
        } else {
            this.errors = {
                message: ErrorMessage.INTERNAL_ERROR,
            };
        }
    }
}
