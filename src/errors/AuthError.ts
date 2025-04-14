import { AppError } from "./AppError";
import { ErrorCode } from "../constants/errorCodes";
import { HttpStatus } from "../constants/httpStatusCodes";
import { Messages } from "src/constants/messages";

export class AuthenticationError extends AppError {
    readonly statusCode = HttpStatus.UNAUTHORIZED;
    readonly code = ErrorCode.AUTHENTICATION_FAILED;
    readonly errors = {
        token: Messages.AUTH.TOKEN_MISSING,
    };

    constructor(message = Messages.AUTH.LOGIN_FAILED) {
        super(message);
    }
}

export class AuthorizationError extends AppError {
    readonly statusCode = HttpStatus.FORBIDDEN;
    readonly code = ErrorCode.FORBIDDEN;
    readonly errors = undefined;

    constructor(message = Messages.AUTH.FORBIDDEN) {
        super(message);
    }
}
