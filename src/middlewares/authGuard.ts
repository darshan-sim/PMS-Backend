// src/middleware/authGuard.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserContext } from "../auth/userContext";

const JWT_SECRET = process.env.JWT_SECRET!;

export function AuthGuard(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Missing or malformed Authorization header",
        });
        return;
    }
    console.log(header);
    const token = header.split(" ")[1];
    console.log(token)
    try {


        // Directly trust & attach all fields from the token
        const ctx = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            ...(payload.role === "student" && { studentId: payload.studentId }),
            ...(payload.role === "placement_cell" && {
                placementCellId: payload.placementCellId,
            }),
            ...(payload.role === "recruiter" && {
                recruiterId: payload.recruiterId,
            }),
        };
        req.user = ctx as UserContext;

        next();
        return;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
}
