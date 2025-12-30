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
        // Build DATABASE_URL with connection pooling parameters
        const dbUrl = new URL(process.env.DATABASE_URL || '');

        // Clear and set fresh pooling parameters
        dbUrl.searchParams.delete('prepared_statements');
        dbUrl.searchParams.delete('statement_cache_size');
        dbUrl.searchParams.delete('pgbouncer');

        dbUrl.searchParams.set('prepared_statements', 'false');
        dbUrl.searchParams.set('statement_cache_size', '0');

        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: dbUrl.toString()
                }
            },
            errorFormat: 'pretty'
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
