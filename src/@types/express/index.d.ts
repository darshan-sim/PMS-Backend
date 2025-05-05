import { UserContext } from "../../auth/userContext";

declare module "express-serve-static-core" {
    interface Request {
        user: UserContext;
    }
}
