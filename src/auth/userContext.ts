export interface BaseContext {
    userId: string;
    email: string;
    role: "student" | "placement_cell" | "recruiter";
}

export interface StudentContext extends BaseContext {
    role: "student";
    studentId: string;
}

export interface PlacementCellContext extends BaseContext {
    role: "placement_cell";
    placementCellId: string;
}

export interface RecruiterContext extends BaseContext {
    role: "recruiter";
    recruiterId: string;
}

export type UserContext =
    | StudentContext
    | PlacementCellContext
    | RecruiterContext;
