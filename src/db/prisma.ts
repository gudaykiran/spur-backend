/**
 * Prisma client instance
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient | null = null;

try {
    prismaInstance =
        globalForPrisma.prisma ||
        new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
        });

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prismaInstance;
    }
} catch (err) {
    console.error('Failed to initialize Prisma:', err);
    // Create a dummy client that logs errors
    prismaInstance = new PrismaClient();
}

export const prisma = prismaInstance as PrismaClient;
