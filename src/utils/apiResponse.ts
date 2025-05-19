import { Response } from 'express';
import { ApiResponse, Pagination } from '../types/response.type';
import { AppError } from '../errors/AppError';
import { SuccessMessage } from '../constants/messages';
import { HttpStatus } from '../constants/httpStatusCodes';

export class ResponseHandler {
    static fetched<T>(
        res: Response,
        data: T,
        message: string = 'Request successful',
        pagination?: Pagination
    ): Response<ApiResponse<T>> {
        const response: ApiResponse<T> = {
            success: true,
            message: message || 'Request successful',
            data,
        };

        if (pagination) {
            response.pagination = pagination;
        }

        return res.status(HttpStatus.OK).json(response);
    }

    static success<T>(
        res: Response,
        data: T,
        message: string = 'Request successful'
    ): Response<ApiResponse<T>> {
        return res.status(HttpStatus.OK).json({
            success: true,
            message,
            data,
        });
    }

    static created<T>(
        res: Response,
        data: T,
        message: string = SuccessMessage.CREATED
    ): Response<ApiResponse<T>> {
        return res.status(201).json({
            success: true,
            message: message || SuccessMessage.CREATED,
            data,
        });
    }

    static error(res: Response, error: AppError): Response<ApiResponse<null>> {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            errors: error.errors,
        });
    }
}

// Pagination helper
export const calculatePagination = (
    total: number,
    page: number,
    pageSize: number
): Pagination => ({
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
});
