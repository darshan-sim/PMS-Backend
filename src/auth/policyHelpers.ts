import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Recruiter, Role, Prisma } from '@prisma/client';
import { UserContext } from './userContext';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';

const prisma = new PrismaClient();

type Action = 'read' | 'create' | 'update' | 'delete';

// Extend this type to add more resources as needed
export type Resource = 'Recruiter';

// Map resource types to their Prisma model types
// Extend this ResourceMap to add more resources as needed
type ResourceMap = {
    Recruiter: Recruiter;
};

// Simplify context passing for related data lookup
export interface PolicyContext<R extends Resource> {
    user: UserContext;
    resource?: ResourceMap[R];
    resourceId?: string;
    attrs?: Partial<ResourceMap[R]>;
    // Add a custom lookup function for related resources
    getRelatedResource: <T extends Resource>(
        resource: T,
        id: string
    ) => Promise<ResourceMap[T] | null>;
}

export type PolicyFn<R extends Resource> = (
    context: PolicyContext<R>
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

// Factory for creating related resource lookup functions
async function createResourceLookup(_userCtx: UserContext) {
    // Cache to avoid duplicate database queries
    const cache = new Map<string, unknown>();

    return async function getRelatedResource<T extends Resource>(
        resource: T,
        id: string
    ): Promise<ResourceMap[T] | null> {
        const cacheKey = `${resource}:${id}`;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey) as ResourceMap[T] | null;
        }

        // Lookup logic based on resource type
        let result = null;
        switch (resource) {
            case 'Recruiter':
                result = await prisma.recruiter.findUnique({
                    where: { recruiterId: id },
                });
                break;
            // Add more cases for other resources
        }

        if (result) {
            cache.set(cacheKey, result);
        }
        return result as ResourceMap[T] | null;
    };
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
            throw new UnauthorizedError();
        }

        const roleRules = policies[user.role]?.[resource];
        const policyFn = roleRules?.[action] as PolicyFn<Res> | undefined;
        if (!policyFn) {
            throw new ForbiddenError('Not allowd');
        }

        let record: ResourceMap[Res] | undefined;
        let resourceId: string | undefined;

        if (extractId) {
            resourceId = extractId(req);

            switch (resource) {
                case 'Recruiter': {
                    const where: Prisma.RecruiterWhereUniqueInput = {
                        recruiterId: resourceId,
                    };
                    const result = await prisma.recruiter.findUnique({ where });
                    if (result) record = result as ResourceMap[Res];
                    break;
                }
            }
            console.log('record', record);
            if (!record) {
                console.log('record not found');
                throw new NotFoundError();
            }
        }

        // Create lookup function for related resources
        const getRelatedResource = await createResourceLookup(user);

        // Create policy context
        const context: PolicyContext<Res> = {
            user,
            resource: record,
            resourceId,
            attrs: req.body as Partial<ResourceMap[Res]>,
            getRelatedResource,
        };
        console.log('context', context);
        const allowed = await policyFn(context);
        if (!allowed) {
            throw new ForbiddenError('nop');
        }
        next();
    };
}

// Helper predicates - updated to use the new context object
export const ownRecruiter: PolicyFn<'Recruiter'> = ({ user, resource }) =>
    user.role === 'recruiter' && resource?.representativeId === user.userId;

definePolicy('recruiter', {
    Recruiter: {
        create: () => true,
        read: ownRecruiter,
        update: ownRecruiter,
        delete: ownRecruiter,
    },
});

export {};
