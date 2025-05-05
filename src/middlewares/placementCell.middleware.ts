import { authorize } from "../auth/policyHelpers";

export const authorizePlacementCell = authorize(
    "update",
    "PlacementCell",
    (req) => req.params.id
);
