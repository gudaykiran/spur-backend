import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'CLAUDE_API_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
    }
}

// Prisma singleton for serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
    errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize Claude
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

const ChatMessageSchema = z.object({
    message: z.string().min(1),
    sessionId: z.string().optional()
});

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

        // Create or retrieve conversation
        let conversationId: string;

        if (!body.sessionId) {
            const conversation = await prisma.conversation.create({ data: {} });
            conversationId = conversation.id;
        } else {
            conversationId = body.sessionId;
            const exists = await prisma.conversation.findUnique({
                where: { id: conversationId }
            });
            if (!exists) {
                const conversation = await prisma.conversation.create({ data: {} });
                conversationId = conversation.id;
            }
        }

        // Save user message
        await prisma.message.create({
            data: {
                conversationId,
                sender: 'user',
                text: body.message
            }
        });

        // Get conversation history
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 20
        });

        // Generate AI response
        const conversationHistory = messages.map((m: typeof messages[number]) => ({
            role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: m.text
        }));

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: conversationHistory
        });

        const aiReply = response.content[0].type === 'text'
            ? response.content[0].text
            : 'I apologize, but I could not generate a response.';

        // Save AI response
        await prisma.message.create({
            data: {
                conversationId,
                sender: 'ai',
                text: aiReply
            }
        });

        return res.status(200).json({
            reply: aiReply,
            sessionId: conversationId
        });
    } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        
        // Check if it's a database connection error
        if (errorMessage.includes('Can\'t reach database server')) {
            return res.status(503).json({ 
                error: 'Database connection failed. Please check DATABASE_URL environment variable in Vercel.' 
            });
        }
        
        return res.status(500).json({
            error: errorMessage
        });
    }
}
