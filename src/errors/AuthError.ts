import { AppError } from "./AppError";
import { ErrorCode } from "../constants/errorCodes";
import { HttpStatus } from "../constants/httpStatusCodes";
import { ErrorMessage } from "src/constants/messages";

export class AuthenticationError extends AppError {
    readonly statusCode = HttpStatus.UNAUTHORIZED;
    readonly errors = {
        token: ErrorMessage.TOKEN_MISSING,
    };

    constructor(message = ErrorMessage.TOKEN_MISSING) {
        super(message);
    }
}

export class AuthorizationError extends AppError {
    readonly statusCode = HttpStatus.FORBIDDEN;
    readonly code = ErrorCode.FORBIDDEN;
    readonly errors = undefined;

    constructor(message = ErrorMessage.FORBIDDEN) {
        super(message);
    }
}
