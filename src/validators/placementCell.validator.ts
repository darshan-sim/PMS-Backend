import { z } from "zod";

export const placementCellIdSchema = z.object({
    id: z.string().uuid("Invalid placement cell ID"),
});

export const placementCellUpdateSchema = z.object({
    placementCellName: z
        .string()
        .min(1, "Placement cell name is required")
        .optional(),
    placementCellEmail: z.string().email("Invalid email address").optional(),
    website: z.string().url("Invalid website URL").optional(),
    isVerified: z.boolean().optional(),
});

export type PlacementCellUpdateInput = z.infer<
    typeof placementCellUpdateSchema
>;
