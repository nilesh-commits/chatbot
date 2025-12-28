import {
    createConversation,
    getConversation,
    createMessage,
    getMessages,
    getConversationWithMessages,
} from '../models/database';
import { generateReply } from './llm.service';
import { config } from '../config';
import { Message, MessageDTO, SendMessageResponse, ChatHistoryResponse } from '../types';

/**
 * Validate and sanitize user message
 */
function validateMessage(message: string): { valid: boolean; error?: string; sanitized: string } {
    // Check for empty message
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message is required', sanitized: '' };
    }

    const trimmed = message.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Message cannot be empty', sanitized: '' };
    }

    if (trimmed.length < config.validation.minMessageLength) {
        return { valid: false, error: 'Message is too short', sanitized: '' };
    }

    // Truncate if too long
    let sanitized = trimmed;
    if (sanitized.length > config.validation.maxMessageLength) {
        sanitized = sanitized.substring(0, config.validation.maxMessageLength);
    }

    return { valid: true, sanitized };
}

/**
 * Validate session ID format (UUID)
 */
function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Convert database message to DTO
 */
function toMessageDTO(message: Message): MessageDTO {
    return {
        id: message.id,
        sender: message.sender,
        text: message.text,
        timestamp: message.created_at.toISOString(),
    };
}

/**
 * Get or create a conversation session
 */
async function getOrCreateSession(sessionId?: string): Promise<string> {
    if (sessionId && isValidUUID(sessionId)) {
        const existing = await getConversation(sessionId);
        if (existing) {
            return existing.id;
        }
    }

    // Create new conversation
    const newConversation = await createConversation();
    return newConversation.id;
}

/**
 * Handle incoming chat message
 */
export async function handleChatMessage(
    message: string,
    sessionId?: string
): Promise<SendMessageResponse> {
    // Validate message
    const validation = validateMessage(message);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Get or create session
    const conversationId = await getOrCreateSession(sessionId);

    // Save user message
    await createMessage(conversationId, 'user', validation.sanitized);

    // Get conversation history for context
    const history = await getMessages(conversationId, config.llm.maxHistoryMessages);

    // Generate AI reply
    const reply = await generateReply(
        history.slice(0, -1), // Exclude the message we just added
        validation.sanitized
    );

    // Save AI reply
    await createMessage(conversationId, 'ai', reply);

    return {
        reply,
        sessionId: conversationId,
    };
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    if (!sessionId || !isValidUUID(sessionId)) {
        throw new Error('Invalid session ID');
    }

    const result = await getConversationWithMessages(sessionId);

    if (!result) {
        throw new Error('Conversation not found');
    }

    return {
        sessionId: result.conversation.id,
        messages: result.messages.map(toMessageDTO),
    };
}

/**
 * Check if a session exists
 */
export async function sessionExists(sessionId: string): Promise<boolean> {
    if (!sessionId || !isValidUUID(sessionId)) {
        return false;
    }

    const conversation = await getConversation(sessionId);
    return conversation !== null;
}
