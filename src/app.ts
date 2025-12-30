/**
 * Express app configuration
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import chatRouter from './routes/chat.js';

const app = express();

// CORS configuration - Allow all origins for now
const corsOptions: CorsOptions = {
    origin: true, // Allow any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));

// Explicit CORS headers middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Routes
try {
    app.use('/api/chat', chatRouter);
} catch (err) {
    console.error('Error mounting chat router:', err);
    app.use('/api/chat', (req: Request, res: Response) => {
        res.status(503).json({ error: 'Chat service unavailable' });
    });
}

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
