import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import prisma from "./prisma";
import { errorHandler } from "./middlewares/errorHandler.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/users", async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
