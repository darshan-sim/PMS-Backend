import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { errorResponse } from "../utils/apiResponse";
import { ErrorCode } from "../constants/errorCodes";
import { Messages } from "src/constants/messages";
import { HttpStatus } from "src/constants/httpStatusCodes";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json(
            errorResponse(err.code, err.message, err.errors ?? {})
        );
        return;
    }

    console.error("Unexpected error:", err);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, Messages.SERVER.ERROR)
    );
    return;
};
