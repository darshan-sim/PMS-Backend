import {
    PlacementCell,
    Recruiter,
    Student,
    User,
    Prisma,
} from "@prisma/client";

// Student Types
export type StudentUpdateInput = Prisma.StudentUpdateInput;

export type StudentCreateInput = Omit<
    Student,
    "studentId" | "createdAt" | "updatedAt" | "deletedAt"
>;

// Placement Cell Types
export type PlacementCellUpdateInput = Prisma.PlacementCellUpdateInput;

export type PlacementCellCreateInput = Omit<
    PlacementCell,
    "placementCellId" | "createdAt" | "updatedAt" | "deletedAt"
>;

// Recruiter Types
export type RecruiterUpdateInput = Prisma.RecruiterUpdateInput;

export type RecruiterCreateInput = Omit<
    Recruiter,
    "recruiterId" | "createdAt" | "updatedAt" | "deletedAt"
>;

// User Types
export type UserUpdateInput = Prisma.UserUpdateInput;

export type UserCreateInput = Omit<
    User,
    "userId" | "createdAt" | "updatedAt" | "deletedAt"
>;
