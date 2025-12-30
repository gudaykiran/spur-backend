/**
 * LLM Service - Handles Claude API integration
 */
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.CLAUDE_API_KEY || '';
console.log('Initializing Claude with API Key:', apiKey ? `✓ Key loaded (${apiKey.substring(0, 10)}...)` : '✗ No API key');
const anthropic = new Anthropic({ apiKey });

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

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * Generate a reply to a user message using Gemini
 */
export async function generateReply(
    conversationHistory: Message[],
    userMessage: string
): Promise<string> {
    try {
        console.log('generateReply called with message:', userMessage);

        // Build message history for Claude
        const messages = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.content
        }));

        // Add current user message
        messages.push({
            role: 'user' as const,
            content: userMessage
        });

        console.log('Calling Claude API with', messages.length, 'messages');
        console.log('System prompt length:', SYSTEM_PROMPT.length);

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 100,
            system: SYSTEM_PROMPT,
            messages: messages
        });

        console.log('Claude response received:', response.stop_reason);

        const reply = response.content[0]?.type === 'text' ? response.content[0].text : null;

        if (!reply) {
            throw new Error('No response from Claude');
        }

        console.log('✓ Claude response generated successfully');
        return reply;
    } catch (error) {
        console.error('❌ LLM Error:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));

        // Log detailed error info for debugging
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        // Fallback responses based on error type
        if (error instanceof Error) {
            if (error.message.includes('rate_limit') || error.message.includes('429')) {
                return 'We are experiencing high demand. Please try again in a moment.';
            }
            if (error.message.includes('timeout') || error.message.includes('408')) {
                return 'The request took too long to process. Please try again.';
            }
            if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('Incorrect API key')) {
                console.error('⚠️  API Key Authentication Failed');
                return 'Authentication error with Claude API. Please check your API key.';
            }
        }

        return 'Sorry, our support agent is temporarily unavailable. Please try again shortly.';
    }
}
