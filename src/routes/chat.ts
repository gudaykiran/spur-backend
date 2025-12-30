/**
 * Chat Routes
 */
import { Router, Request, Response } from 'express';
import { ChatMessageSchema, ChatHistoryQuerySchema } from '../validation/chat.schema.js';
import { handleChatMessage, getChatHistory } from '../services/chatService.js';
import { AppError, handleError } from '../utils/errors.js';

const router = Router();

/**
 * GET /chat/test
 * Test the API
 */
router.get('/test', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Chat API is working' });
});

/**
 * POST /api/chat
 * Send a message and get AI response
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const body = ChatMessageSchema.parse(req.body);

        const result = await handleChatMessage(body.message, body.sessionId);

        res.json(result);
    } catch (error) {
        const { statusCode, message } = handleError(error);
        res.status(statusCode).json({ error: message });
    }
});

/**
 * GET /chat/history
 * Fetch conversation history for a session
 */
router.get('/history', async (req: Request, res: Response) => {
    try {
        const { sessionId } = ChatHistoryQuerySchema.parse(req.query);

        const messages = await getChatHistory(sessionId);

        res.json(messages);
    } catch (error) {
        const { statusCode, message } = handleError(error);
        res.status(statusCode).json({ error: message });
    }
});

export default router;
