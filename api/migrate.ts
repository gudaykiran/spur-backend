import type { VercelRequest, VercelResponse } from '@vercel/node';
import { execSync } from 'child_process';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Run Prisma migrations
        console.log('Running Prisma migrations...');
        const output = execSync('npx prisma migrate deploy', {
            cwd: process.cwd(),
            stdio: 'pipe'
        }).toString();

        console.log('Migration output:', output);
        return res.status(200).json({
            success: true,
            message: 'Migrations completed successfully',
            output
        });
    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Migration failed'
        });
    }
}
