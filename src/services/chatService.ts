/**
 * Chat Service - Business logic for chat operations
 */
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db/prisma';
import { generateReply } from './llmService';
import { cacheHistory, getCachedHistory, getCacheKey, deleteCache } from './cacheService';
import { AppError } from '../utils/errors';

const HISTORY_LIMIT = 10; // Number of past messages to include in LLM context

/**
 * Handle incoming chat message: persist, generate reply, persist reply
 */
export async function handleChatMessage(
    messageText: string,
    sessionId?: string
): Promise<{ reply: string; sessionId: string }> {
    try {
        // Create or retrieve conversation
        let conversationId: string;

        if (!sessionId) {
            // Create new conversation
            console.log('Creating new conversation');
            const conversation = await prisma.conversation.create({
                data: {}
            });
            conversationId = conversation.id;
            console.log('New conversation created:', conversationId);
        } else {
            // Verify conversation exists, if not create a new one
            console.log('Checking if conversation exists:', sessionId);
            const conversation = await prisma.conversation.findUnique({
                where: { id: sessionId }
            });

            if (!conversation) {
                console.log('Conversation not found, creating new one');
                // Instead of throwing error, create a new conversation
                const newConversation = await prisma.conversation.create({
                    data: {}
                });
                conversationId = newConversation.id;
            } else {
                conversationId = sessionId;
            }
        }

        // Save user message
        await prisma.message.create({
            data: {
                conversationId,
                sender: 'user',
                text: messageText
            }
        });

        // Fetch conversation history for LLM context
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: HISTORY_LIMIT
        });

        // Convert DB messages to LLM format
        const llmHistory = messages
            .filter((msg: typeof messages[0]) => msg.id !== undefined) // Exclude the message we just added from context
            .map((msg: typeof messages[0]) => ({
                role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                content: msg.text
            }));

        // Generate AI reply
        console.log('Calling generateReply with history length:', llmHistory.length);
        const aiReply = await generateReply(llmHistory, messageText);
        console.log('AI Reply received:', aiReply);

        // Save AI reply
        await prisma.message.create({
            data: {
                conversationId,
                sender: 'ai',
                text: aiReply
            }
        });

        return {
            reply: aiReply,
            sessionId: conversationId
        };
    } catch (error) {
        console.error('Error in handleChatMessage:', error);
        throw error;
    }
}

/**
 * Fetch all messages for a conversation
 */
export async function getChatHistory(
    sessionId: string
): Promise<
    Array<{
        id: string;
        text: string;
        sender: 'user' | 'ai';
        timestamp: number;
    }>
> {
    // Try to get from cache first
    const cached = await getCachedHistory(sessionId);
    if (cached) {
        console.log('✓ Chat history retrieved from cache');
        return cached;
    }

    // Fallback to database
    const conversation = await prisma.conversation.findUnique({
        where: { id: sessionId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!conversation) {
        return [];
    }

    const history = conversation.messages.map((msg: typeof conversation.messages[0]) => ({
        id: msg.id,
        text: msg.text,
        sender: (msg.sender === 'user' ? 'user' : 'ai') as 'user' | 'ai',
        timestamp: msg.createdAt.getTime()
    }));

    // Cache the history for future requests
    await cacheHistory(sessionId, history);

    return history;
}
