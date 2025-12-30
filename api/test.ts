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
            hasCLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY,
            connectionDetails: {} as any
        },
        prismaTest: {
            status: 'testing...',
            error: null as string | null
        }
    };

    try {
        // Build DATABASE_URL with comprehensive connection pooling configuration
        let dbUrl = new URL(process.env.DATABASE_URL || '');

        diagnostics.environment.connectionDetails = {
            hostname: dbUrl.hostname,
            port: dbUrl.port,
            isPooler: dbUrl.hostname.includes('.pooler.supabase.com')
        };

        // Clear all existing parameters
        Array.from(dbUrl.searchParams.keys()).forEach(key => {
            dbUrl.searchParams.delete(key);
        });

        // Set comprehensive pooling parameters
        dbUrl.searchParams.set('prepared_statements', 'false');
        dbUrl.searchParams.set('statement_cache_size', '0');
        dbUrl.searchParams.set('pgbouncer', 'true');
        dbUrl.searchParams.set('sslmode', 'require');
        dbUrl.searchParams.set('connect_timeout', '10');
        diagnostics.prismaTest.status = 'success';

        await prisma.$disconnect();
    } catch (error) {
        diagnostics.prismaTest.status = 'failed';
        diagnostics.prismaTest.error = error instanceof Error ? error.message : String(error);
    }

    return res.status(200).json(diagnostics);
}
