import type { VercelRequest, VercelResponse } from '@vercel/node';
import { execSync } from 'child_process';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Prepare environment with connection pooling parameters
        let dbUrl = new URL(process.env.DATABASE_URL || '');

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

        console.log('🔄 Running Prisma migrations with pooling configuration...');

        const output = execSync('npx prisma migrate deploy', {
            cwd: process.cwd(),
            stdio: 'pipe',
            env: {
                ...process.env,
                DATABASE_URL: dbUrl.toString()
            }
        }).toString();

        console.log('✅ Migration output:', output);
        return res.status(200).json({
            success: true,
            message: 'Migrations completed successfully',
            output
        });
    } catch (error) {
        console.error('❌ Migration error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Migration failed'
        });
    }
}
