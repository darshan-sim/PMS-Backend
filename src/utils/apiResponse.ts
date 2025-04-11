import { ErrorCode } from "../constants/errorCodes";

export interface PaginationInfo {
    readonly totalItems: number;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly pageSize: number;
}

export interface ApiErrorResponse {
    readonly success: false;
    readonly message: string;
    readonly code: ErrorCode;
    readonly errors: Record<string, string>;
}

export interface ApiSuccessResponse<T> {
    readonly success: true;
    readonly message: string;
    readonly data: T;
    readonly pagination?: PaginationInfo;
}

export function successResponse<T>(
    message: string,
    data: T,
    pagination?: PaginationInfo
): ApiSuccessResponse<T> {
    return {
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    };
}

export function errorResponse(
    code: ErrorCode,
    message: string,
    errors: Record<string, string> = {}
): ApiErrorResponse {
    return {
        success: false,
        message,
        code,
        errors,
    };
}
