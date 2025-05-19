import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatusCodes';
import { ErrorMessage } from 'src/constants/messages';
import { ErrorCode } from 'src/constants/errorCodes';

export class AuthenticationError extends AppError {
    readonly statusCode = HttpStatus.UNAUTHORIZED;
    readonly errorCode = ErrorCode.TOKEN_MISSING;
    readonly errors = {
        TOKEN_MISSING: ErrorMessage.TOKEN_MISSING,
    };

    constructor(message = ErrorMessage.TOKEN_MISSING) {
        super(message);
    }
}
