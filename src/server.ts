/**
 * Server entry point
 */
import dotenv from 'dotenv';
import app from './app.js';
import { prisma } from './db/prisma.js';
import { initializeCache, disconnectCache } from './services/cacheService.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize on module load
initializeCache();

// Only verify database and start server if running locally or on Node.js
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL === 'false') {
    async function startServer() {
        try {
            // Verify database connection
            await prisma.$queryRaw`SELECT 1`;
            console.log('✓ Database connected');

            // Verify Claude API key
            if (!process.env.CLAUDE_API_KEY) {
                throw new Error('CLAUDE_API_KEY environment variable not set');
            }
            console.log('✓ Claude API key configured');

            // Start server
            app.listen(PORT, () => {
                console.log(`✓ Server running on http://localhost:${PORT}`);
                console.log(`✓ Chat API at http://localhost:${PORT}/api/chat`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nShutting down gracefully...');
        await disconnectCache();
        await prisma.$disconnect();
        process.exit(0);
    });

    startServer();
}

// On Vercel, export the app as serverless function
export default app;
