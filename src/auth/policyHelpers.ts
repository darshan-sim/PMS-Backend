import { Request, Response, NextFunction } from "express";
import {
    PrismaClient,
    Student,
    PlacementCell,
    Recruiter,
    Role,
    Prisma,
} from "@prisma/client";
import { UserContext } from "./userContext";

const prisma = new PrismaClient();

type Action = "read" | "create" | "update" | "delete";
export type Resource = "Student" | "PlacementCell" | "Recruiter";

type ResourceMap = {
    Student: Student;
    PlacementCell: PlacementCell;
    Recruiter: Recruiter;
};

export type PolicyFn<R extends Resource> = (
    user: UserContext,
    resource?: ResourceMap[R],
    attrs?: Partial<ResourceMap[R]>
) => boolean | Promise<boolean>;

type PolicyRules = {
    [R in Resource]?: {
        [A in Action]?: PolicyFn<R>;
    };
};

// Type-safe policy structure
const policies: Record<Role, PolicyRules> = {
    student: {},
    placement_cell: {},
    recruiter: {},
};

// Register policy rules
export function definePolicy<RL extends Role>(role: RL, rules: PolicyRules) {
    policies[role] = { ...policies[role], ...rules };
}

// Authorization middleware
export function authorize<Res extends Resource>(
    action: Action,
    resource: Res,
    extractId?: (req: Request) => string
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const roleRules = policies[user.role]?.[resource];
        const policyFn = roleRules?.[action] as PolicyFn<Res> | undefined;
        if (!policyFn) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        let record: ResourceMap[Res] | undefined;
        if (extractId) {
            const id = extractId(req);

            switch (resource) {
                case "Student": {
                    const where: Prisma.StudentWhereUniqueInput = {
                        studentId: id,
                    };
                    const result = await prisma.student.findUnique({ where });
                    if (result) record = result as ResourceMap[Res];
                    break;
                }
                case "PlacementCell": {
                    const where: Prisma.PlacementCellWhereUniqueInput = {
                        placementCellId: id,
                    };
                    const result = await prisma.placementCell.findUnique({
                        where,
                    });
                    if (result) record = result as ResourceMap[Res];
                    break;
                }
                case "Recruiter": {
                    const where: Prisma.RecruiterWhereUniqueInput = {
                        recruiterId: id,
                    };
                    const result = await prisma.recruiter.findUnique({ where });
                    if (result) record = result as ResourceMap[Res];
                    break;
                }
            }

            if (!record) {
                res.status(404).json({ message: `${resource} not found` });
                return;
            }
        }

        const allowed = await policyFn(
            user,
            record,
            req.body as Partial<ResourceMap[Res]>
        );
        if (!allowed) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        next();
    };
}

// Helper predicates
export const ownStudent: PolicyFn<"Student"> = (user, student) =>
    user.role === "student" && student?.studentId === user.userId;

export const inCell: PolicyFn<"Student"> = (user, student) =>
    user.role === "placement_cell" &&
    student?.placementCellId === user.placementCellId;

export const ownRecruiter: PolicyFn<"Recruiter"> = (user, rec) =>
    user.role === "recruiter" && rec?.representativeId === user.userId;

export const studentCanViewPlacementCell: PolicyFn<"PlacementCell"> = async (
    user,
    cell
) => {
    if (user.role !== "student") return false;

    if (cell) {
        const student = await prisma.student.findUnique({
            where: { studentId: user.userId },
            select: { placementCellId: true },
        });

        return student?.placementCellId === cell.placementCellId;
    }

    return true;
};

type StudentAttrs = Partial<Pick<Student, "fullName" | "cgpa" | "resumeUrl">>;
// Register policies at startup
definePolicy("student", {
    Student: {
        read: ownStudent,
        update: (user, student, attrs?: StudentAttrs) => {
            // Students can only update their own profile
            if (!ownStudent(user, student)) return false;

            // If student is placed, they can only update resume
            if (student?.placementStatus === "placed") {
                const keys = Object.keys(attrs ?? {}) as (keyof StudentAttrs)[];
                return keys.every((key) => key === "resumeUrl");
            }

            // Otherwise, they can update any field
            return true;
        },
        delete: () => false,
    },
    PlacementCell: {
        read: studentCanViewPlacementCell,
    },
});

definePolicy("placement_cell", {
    Student: {
        read: inCell,
        update: inCell,
        delete: inCell, // Placement cell can delete students within their cell
    },
    PlacementCell: {
        read: (user, cell) =>
            user.role === "placement_cell" && cell?.adminId === user.userId,
        update: (user, cell) =>
            user.role === "placement_cell" && cell?.adminId === user.userId,
        delete: (user, cell) =>
            user.role === "placement_cell" && cell?.adminId === user.userId,
    },
});

definePolicy("recruiter", {
    Recruiter: {
        create: () => true,
        read: ownRecruiter,
        update: ownRecruiter,
        delete: ownRecruiter,
    },
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: UserContext; // Add the user property
        }
    }
}

// ensure this file is a module for declaration merging
export {};
