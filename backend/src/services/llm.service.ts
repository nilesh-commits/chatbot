import OpenAI from 'openai';
import { config } from '../config';
import { systemPrompt } from '../config/knowledge';
import { ChatMessage, Message } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

/**
 * Convert database messages to LLM chat format
 */
function formatMessagesForLLM(messages: Message[]): ChatMessage[] {
    return messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
    }));
}

/**
 * Truncate message if too long
 */
function truncateMessage(text: string, maxLength: number = 1000): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '... [message truncated]';
}

/**
 * Generate a reply using the LLM
 * 
 * @param history - Previous messages in the conversation
 * @param userMessage - The current user message
 * @returns The AI-generated reply
 */
export async function generateReply(
    history: Message[],
    userMessage: string
): Promise<string> {
    // Check if API key is configured
    if (!config.openaiApiKey) {
        console.error('OpenAI API key not configured');
        return "I'm sorry, but I'm currently unable to process your request. Please try again later or contact support directly at support@techstyle.com.";
    }

    try {
        // Prepare messages for the API
        const formattedHistory = formatMessagesForLLM(
            history.slice(-config.llm.maxHistoryMessages)
        );

        // Truncate messages in history for cost control
        const truncatedHistory = formattedHistory.map((msg) => ({
            ...msg,
            content: truncateMessage(msg.content),
        }));

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...truncatedHistory,
            { role: 'user', content: truncateMessage(userMessage) },
        ];

        // Call OpenAI API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.llm.timeoutMs);

        try {
            const response = await openai.chat.completions.create(
                {
                    model: config.llm.model,
                    messages: messages as OpenAI.ChatCompletionMessageParam[],
                    max_tokens: config.llm.maxTokens,
                    temperature: config.llm.temperature,
                },
                {
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            const reply = response.choices[0]?.message?.content;

            if (!reply) {
                console.error('Empty response from OpenAI');
                return "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
            }

            return reply.trim();
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (error: unknown) {
        // Handle specific error types
        if (error instanceof OpenAI.APIError) {
            console.error('OpenAI API Error:', error.status, error.message);

            if (error.status === 401) {
                return "I'm experiencing authentication issues. Please contact support for assistance.";
            }

            if (error.status === 429) {
                return "I'm receiving a lot of requests right now. Please wait a moment and try again.";
            }

            if (error.status === 500 || error.status === 503) {
                return "I'm having trouble connecting to my systems. Please try again in a few moments.";
            }
        }

        if (error instanceof Error && error.name === 'AbortError') {
            console.error('OpenAI request timed out');
            return "I'm taking longer than expected to respond. Please try again or contact support if the issue persists.";
        }

        console.error('Unexpected error in generateReply:', error);
        return "I apologize, but something went wrong. Please try again or contact our support team at support@techstyle.com.";
    }
}

/**
 * Health check for LLM service
 */
export function isLLMConfigured(): boolean {
    return !!config.openaiApiKey;
}
