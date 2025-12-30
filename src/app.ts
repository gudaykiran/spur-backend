/**
 * Express app configuration
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import chatRouter from './routes/chat';

const app = express();

// CORS configuration
const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Allow all Vercel URLs (*.vercel.app)
        if (origin.includes('vercel.app')) {
            return callback(null, true);
        }
        
        // Allow specific frontend URL from environment
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        
        // For development, allow all origins
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        callback(null, true); // Allow by default for now
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
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
app.use('/api/chat', chatRouter);

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
