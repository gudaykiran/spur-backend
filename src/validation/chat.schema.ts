import { z } from 'zod';

export const ChatMessageSchema = z.object({
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(1000, 'Message exceeds 1000 character limit')
        .refine((msg) => msg.trim().length > 0, 'Message cannot be only whitespace'),
    sessionId: z.string().uuid().optional()
});

export const ChatHistoryQuerySchema = z.object({
    sessionId: z.string().uuid('Invalid session ID format')
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type ChatHistoryQuery = z.infer<typeof ChatHistoryQuerySchema>;
