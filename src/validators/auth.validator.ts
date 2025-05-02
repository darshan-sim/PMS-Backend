import { z } from "zod";
import { Role } from "@prisma/client";

// Common user validation schema
export const userValidationSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z
            .string()
            .min(6, "Confirm password must be at least 6 characters"),
        role: z
            .nativeEnum(Role)
            .refine((val) => Object.values(Role).includes(val), {
                message: "Invalid role",
            }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Student profile data validation
const studentRegisterSchema = z.object({
    enrollmentNumber: z.string().min(1, "Enrollment number is required"),
    fullName: z.string().min(1, "Full name is required"),
    degreeId: z.string().min(1, "Degree ID is required"),
    placementCellId: z.string().min(1, "Placement cell ID is required"),
});

// Placement Cell profile data validation
const placementCellRegisterSchema = z.object({
    placementCellName: z.string().min(1, "Placement cell name is required"),
    domains: z.array(z.string()).min(1, "At least one domain is required"),
    branchName: z.string().min(1, "Branch name is required"),
    degreeNames: z
        .array(z.string())
        .min(1, "At least one degree name is required"),
    placementCellEmail: z.string().email("Invalid email address"),
    website: z.string().url("Invalid website URL"),
});

// Recruiter profile data validation
const recruiterRegisterSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    representativePosition: z
        .string()
        .min(1, "Representative position is required"),
    description: z.string(),
    website: z.string().url("Invalid website URL"),
    companyEmail: z.string().email("Invalid email address"),
});

// Union schema to validate based on role, with each profile's data specifically named
export const registerValidationSchema = userValidationSchema.and(
    z.union([
        // Student role validation
        z.object({
            role: z.literal(Role.student),
            studentProfileData: studentRegisterSchema,
        }),

        // Placement cell role validation
        z.object({
            role: z.literal(Role.placement_cell),
            placementCellProfileData: placementCellRegisterSchema,
        }),

        // Recruiter role validation
        z.object({
            role: z.literal(Role.recruiter),
            recruiterProfileData: recruiterRegisterSchema,
        }),
    ])
);
