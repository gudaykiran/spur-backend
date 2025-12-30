import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ChatMessageSchema } from '../src/validation/chat.schema.js';
import { handleChatMessage } from '../src/services/chatService.js';
import { handleError } from '../src/utils/errors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = ChatMessageSchema.parse(req.body);
        const result = await handleChatMessage(body.message, body.sessionId);
        return res.status(200).json(result);
    } catch (error) {
        const { statusCode, message } = handleError(error);
        return res.status(statusCode).json({ error: message });
    }
}
