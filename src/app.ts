import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import authRouter from './routes/auth.route';
import publicRoutes from './routes/public.route';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { ResponseHandler } from './utils/apiResponse';
import { NotFoundError } from './errors/NotFoundError';
import { RateLimitError } from './errors/RateLimitError';
import recruiterRoutes from './routes/recruiter.route';
import prisma from './config/prisma';

const app = express();

// Security Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    })
);

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100000,
        handler: (req: Request, res: Response) => {
            ResponseHandler.error(res, new RateLimitError());
        },
    })
);

// Body Parsing
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', publicRoutes);
app.use('/api/v1/recruiters', recruiterRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Heart is betting.....' });
});

// 404 Handler
app.use((req: Request, res: Response) => {
    ResponseHandler.error(res, new NotFoundError());
});

// Error Handling
app.use(errorHandler);

// Database Connection
prisma.$connect().catch((_err: Error) => {
    process.exit(1);
});

export default app;
