import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
            hasDATABASE_URL: !!process.env.DATABASE_URL,
            databaseUrl: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
            nodeEnv: process.env.NODE_ENV,
            hasCLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY
        },
        prismaTest: {
            status: 'testing...',
            error: null as string | null
        }
    };

    try {
        const prisma = new PrismaClient({
            errorFormat: 'pretty',
            log: ['error', 'warn']
        });

        // Test query
        await prisma.$queryRaw`SELECT 1`;
        diagnostics.prismaTest.status = 'success';
        
        await prisma.$disconnect();
    } catch (error) {
        diagnostics.prismaTest.status = 'failed';
        diagnostics.prismaTest.error = error instanceof Error ? error.message : String(error);
    }

    return res.status(200).json(diagnostics);
}
