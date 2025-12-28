// API Types
export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

export interface SendMessageResponse {
    reply: string;
    sessionId: string;
}

export interface ChatHistoryResponse {
    sessionId: string;
    messages: Message[];
}

export interface ApiError {
    error: string;
    message: string;
}

// API Base URL - uses Vite proxy in dev mode
const API_BASE = '/api';

/**
 * Send a message to the AI and get a reply
 */
export async function sendMessage(
    message: string,
    sessionId?: string
): Promise<SendMessageResponse> {
    const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    const response = await fetch(`${API_BASE}/chat/${sessionId}/history`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Conversation not found');
        }
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Failed to fetch history');
    }

    return response.json();
}

/**
 * Check if the API is healthy
 */
export async function healthCheck(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
