import { NextFunction, Request, Response } from "express";
import {
    registerValidationSchema,
    userValidationSchema,
} from "../validators/auth.validator";
import { ResponseHandler } from "src/utils/apiResponse";
import {
    registerUser,
    validateUsernameAndEmail,
} from "../services/auth.service";
import { SuccessMessage } from "src/constants/messages";

export const validateUserInput = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = userValidationSchema.parse(req.body);
        const { username, email } = data;

        await validateUsernameAndEmail(username, email);

        ResponseHandler.fetched(res, SuccessMessage.VALIDATION_SUCCESSFUL);
    } catch (error) {
        next(error);
    }
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = registerValidationSchema.parse(req.body);

        const result = await registerUser(validatedData);

        ResponseHandler.created(res, result, SuccessMessage.USER_REGISTERED);
    } catch (error) {
        next(error);
    }
};
