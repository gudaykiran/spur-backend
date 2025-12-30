import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

// Validate required environment variables
if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL environment variable is not set');
}
if (!process.env.CLAUDE_API_KEY) {
    console.error('FATAL: CLAUDE_API_KEY environment variable is not set');
}

// Build DATABASE_URL with comprehensive connection pooling configuration
function getPrismaClient() {
    let dbUrl = new URL(process.env.DATABASE_URL || '');

    console.log('🔗 Original connection:', {
        hostname: dbUrl.hostname,
        port: dbUrl.port,
        isPooler: dbUrl.hostname.includes('.pooler.supabase.com')
    });

    // Clear all existing parameters
    Array.from(dbUrl.searchParams.keys()).forEach(key => {
        dbUrl.searchParams.delete(key);
    });

    // Set comprehensive pooling parameters
    dbUrl.searchParams.set('prepared_statements', 'false');
    dbUrl.searchParams.set('statement_cache_size', '0');
    dbUrl.searchParams.set('pgbouncer', 'true');

    // SSL mode for security
    dbUrl.searchParams.set('sslmode', 'require');

    // Connection timeout
    dbUrl.searchParams.set('connect_timeout', '10');

    const finalUrl = dbUrl.toString();
    console.log('✅ Prisma connection URL configured with pooling parameters');

    return new PrismaClient({
        datasources: {
            db: {
                url: finalUrl
            }
        },
        errorFormat: 'pretty',
    });
}

// Initialize Claude
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful e-commerce support assistant (like Shopify chat).

RESPONSE STYLE:
- Start with relevant emoji/icon (📦, 🚚, 💳, ❓, ✅, etc.)
- ONE sentence maximum per response
- Direct, action-oriented, professional
- NO flowery language, NO poetry, NO long explanations
- Ask clarifying questions if needed
- Always end with next action or question

EXAMPLES OF YOUR RESPONSES:
"📦 Orders ship within 2-3 business days. What's your order number?"
"🚚 Standard shipping is FREE on $50+ orders. Want express delivery?"
"💳 We accept all major cards. Having payment issues?"
"✅ Your order is confirmed! You'll get tracking soon."
"❓ What can I help you with today?"

Quick Info:
📦 Shipping: Free standard (5-7 days) on $50+, Express $15 (2-3 days)
🔄 Returns: 30-day guarantee, free US returns
⏰ Support: Mon-Fri 9am-6pm EST
🌍 We ship worldwide

Be brief. Be helpful. Be professional. Use emoji. Ask questions.`;

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

    // Create fresh Prisma client for this request
    const prisma = getPrismaClient();

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
            model: 'claude-3-haiku-20240307',
            max_tokens: 100,
            system: SYSTEM_PROMPT,
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
        console.error('❌ Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

        // Better error messages for common issues
        if (errorMessage.includes('prepared statement')) {
            return res.status(500).json({
                error: 'Database pooling error - prepared statements conflict. This should not occur with current configuration.'
            });
        }

        if (errorMessage.includes('CLAUDE_API_KEY')) {
            return res.status(500).json({
                error: 'Claude API key not configured'
            });
        }

        if (errorMessage.includes('Can\'t reach database')) {
            return res.status(503).json({
                error: 'Database unavailable - check DATABASE_URL in Vercel environment variables'
            });
        }

        return res.status(500).json({ error: errorMessage });
    } finally {
        await prisma.$disconnect();
    }
}
