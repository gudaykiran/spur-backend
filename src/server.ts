/**
 * Server entry point
 */
import dotenv from 'dotenv';
import app from './app';
import { prisma } from './db/prisma';
import { initializeCache, disconnectCache } from './services/cacheService';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Initialize Redis cache (optional, doesn't block startup)
        // Errors are handled silently - app works without Redis
        initializeCache();

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
