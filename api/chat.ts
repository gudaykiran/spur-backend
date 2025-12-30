import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lazy load the app to avoid initialization errors
let app: any = null;

async function getApp() {
    if (!app) {
        try {
            const { default: appModule } = await import('../src/app');
            app = appModule;
        } catch (err) {
            console.error('Failed to load app:', err);
            throw err;
        }
    }
    return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const appInstance = await getApp();
        return appInstance(req, res);
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal server error', message: String(err) });
    }
}
