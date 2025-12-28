// Message sender types
export type MessageSender = 'user' | 'ai';

// Database models
export interface Conversation {
    id: string;
    created_at: Date;
    updated_at: Date;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender: MessageSender;
    text: string;
    created_at: Date;
}

// API Request/Response types
export interface SendMessageRequest {
    message: string;
    sessionId?: string;
}

export interface SendMessageResponse {
    reply: string;
    sessionId: string;
}

export interface ChatHistoryResponse {
    sessionId: string;
    messages: MessageDTO[];
}

export interface MessageDTO {
    id: string;
    sender: MessageSender;
    text: string;
    timestamp: string;
}

// LLM types
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Error types
export interface ApiError {
    error: string;
    message: string;
}
