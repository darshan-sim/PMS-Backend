import { UserContext } from "../auth/userContext";

declare module "express" {
    interface Request {
        user?: UserContext;
    }
}
