import { writable, derived } from 'svelte/store';
import type { Message } from '$lib/api/chat';

// Session ID for the current conversation
export const sessionId = writable<string | null>(null);

// Messages in the current conversation
export const messages = writable<Message[]>([]);

// Loading state
export const isLoading = writable<boolean>(false);

// Error state
export const error = writable<string | null>(null);

// Typing indicator
export const isTyping = writable<boolean>(false);

// Derived store: has messages
export const hasMessages = derived(messages, ($messages) => $messages.length > 0);

// Derived store: message count
export const messageCount = derived(messages, ($messages) => $messages.length);

/**
 * Add a message to the store
 */
export function addMessage(message: Message): void {
    messages.update((msgs) => [...msgs, message]);
}

/**
 * Clear all messages
 */
export function clearMessages(): void {
    messages.set([]);
}

/**
 * Set session ID and persist to localStorage
 */
export function setSession(id: string): void {
    sessionId.set(id);
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('chatbot_session_id', id);
    }
}

/**
 * Load session from localStorage
 */
export function loadSession(): string | null {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('chatbot_session_id');
    }
    return null;
}

/**
 * Clear session
 */
export function clearSession(): void {
    sessionId.set(null);
    messages.set([]);
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('chatbot_session_id');
    }
}

/**
 * Set error message
 */
export function setError(msg: string | null): void {
    error.set(msg);
    // Auto-clear error after 5 seconds
    if (msg) {
        setTimeout(() => {
            error.update((current) => (current === msg ? null : current));
        }, 5000);
    }
}
