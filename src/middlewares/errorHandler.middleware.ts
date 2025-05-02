import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/apiResponse";
import { ZodError, ZodIssueCode } from "zod";
import { AppError } from "../errors/AppError";
import { ValidationError } from "../errors/ValidationError";
import { InternalServerError } from "../errors/InternalServerError";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let finalError: AppError;

    if (err instanceof AppError) {
        finalError = err;
    } else if (err instanceof ZodError) {
        const formattedErrors = handleZodError(err, req.body);
        finalError = new ValidationError(formattedErrors);
    } else {
        finalError = new InternalServerError(err as Error);
    }

    ResponseHandler.error(res, finalError);
};

export function handleZodError(
    error: ZodError,
    reqBody: Record<string, unknown>
): Record<string, string> {
    const formatted: Record<string, string> = {};
    const role = reqBody?.role;

    const unionIssue = error.issues.find(
        (issue) => issue.code === ZodIssueCode.invalid_union
    );

    if (unionIssue && "unionErrors" in unionIssue) {
        const unionErrors = unionIssue.unionErrors as ZodError[];

        let profileFieldName: string | undefined;
        switch (role) {
            case "student":
                profileFieldName = "studentProfileData";
                break;
            case "placement_cell":
                profileFieldName = "placementCellProfileData";
                break;
            case "recruiter":
                profileFieldName = "recruiterProfileData";
                break;
        }

        if (profileFieldName) {
            const matchedBranch =
                unionErrors.find((branch) =>
                    branch.issues.some(
                        (issue) => issue.path[0] === profileFieldName
                    )
                ) ?? unionErrors[0];

            matchedBranch.issues.forEach((issue) => {
                if (issue.path[0] === profileFieldName) {
                    const fieldKey = issue.path.slice(1).join(".");
                    formatted[fieldKey] = issue.message;
                } else if (issue.path[0] !== "role") {
                    formatted[issue.path[issue.path.length - 1]] =
                        issue.message;
                }
            });
        }
    } else {
        error.issues.forEach((issue) => {
            formatted[issue.path[issue.path.length - 1]] = issue.message;
        });
    }

    if (process.env.NODE_ENV === "development") {
        console.error("Validation failed with errors:", formatted);
    }

    return formatted;
}
