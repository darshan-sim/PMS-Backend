import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "../constants/messages";
import { AppError } from "./AppError";

export class RateLimitError extends AppError {
    statusCode: number;
    errors?: Record<string, string>;

    constructor() {
        super(ErrorMessage.TOO_MANY_REQUESTS);
        this.statusCode = HttpStatus.TOO_MANY_REQUESTS;

        if (process.env.NODE_ENV === "development") {
            this.errors = {
                message: "Too many requests from this IP",
            };
        }
    }
}
