<script lang="ts">
    import { onMount } from "svelte";
    import MessageList from "./MessageList.svelte";
    import ChatInput from "./ChatInput.svelte";
    import {
        sendMessage as apiSendMessage,
        getChatHistory,
        type Message,
    } from "$lib/api/chat";
    import {
        messages,
        sessionId,
        isLoading,
        isTyping,
        error,
        addMessage,
        setSession,
        loadSession,
        clearSession,
        setError,
    } from "$lib/stores/chat";

    let isInitialized = false;

    onMount(async () => {
        // Try to restore session from localStorage
        const savedSessionId = loadSession();

        if (savedSessionId) {
            try {
                const history = await getChatHistory(savedSessionId);
                sessionId.set(history.sessionId);
                messages.set(history.messages);
            } catch (err) {
                // Session not found or expired, clear it
                console.log("Previous session not found, starting fresh");
                clearSession();
            }
        }

        isInitialized = true;
    });

    async function handleSendMessage(event: CustomEvent<string>) {
        const messageText = event.detail;

        if (!messageText.trim()) return;

        // Create a temporary message for optimistic UI
        const tempUserMessage: Message = {
            id: "temp-" + Date.now(),
            sender: "user",
            text: messageText,
            timestamp: new Date().toISOString(),
        };

        // Add user message immediately
        addMessage(tempUserMessage);

        // Set loading state
        isLoading.set(true);
        isTyping.set(true);
        error.set(null);

        try {
            const response = await apiSendMessage(
                messageText,
                $sessionId || undefined,
            );

            // Update session ID if new
            if (!$sessionId || $sessionId !== response.sessionId) {
                setSession(response.sessionId);
            }

            // Add AI response
            const aiMessage: Message = {
                id: "ai-" + Date.now(),
                sender: "ai",
                text: response.reply,
                timestamp: new Date().toISOString(),
            };

            addMessage(aiMessage);
        } catch (err) {
            console.error("Failed to send message:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to send message. Please try again.",
            );
        } finally {
            isLoading.set(false);
            isTyping.set(false);
        }
    }

    function handleNewChat() {
        clearSession();
    }
</script>

<div class="chat-widget">
    <header class="chat-header">
        <div class="header-content">
            <div class="store-info">
                <div class="store-logo">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                </div>
                <div class="store-details">
                    <h1 class="store-name">TechStyle Support</h1>
                    <span class="status">
                        <span class="status-dot"></span>
                        Online
                    </span>
                </div>
            </div>

            <button
                class="new-chat-btn"
                on:click={handleNewChat}
                title="Start new conversation"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        </div>
    </header>

    {#if $error}
        <div class="error-banner">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{$error}</span>
            <button class="dismiss-btn" on:click={() => error.set(null)}
                >×</button
            >
        </div>
    {/if}

    <MessageList messages={$messages} isTyping={$isTyping} />

    <ChatInput disabled={$isLoading} on:send={handleSendMessage} />
</div>

<style>
    .chat-widget {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 100vh;
        background: var(--color-bg-chat);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
    }

    .chat-header {
        flex-shrink: 0;
        background: linear-gradient(
            135deg,
            var(--color-bg-secondary) 0%,
            var(--color-bg-tertiary) 100%
        );
        border-bottom: 1px solid var(--color-border-light);
        padding: var(--spacing-md) var(--spacing-lg);
    }

    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .store-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .store-logo {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-full);
        background: linear-gradient(
            135deg,
            var(--color-primary) 0%,
            var(--color-secondary) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        box-shadow: var(--shadow-glow);
    }

    .store-logo svg {
        width: 100%;
        height: 100%;
        color: white;
    }

    .store-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .store-name {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
    }

    .status {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--font-size-xs);
        color: var(--color-success);
    }

    .status-dot {
        width: 8px;
        height: 8px;
        background: var(--color-success);
        border-radius: var(--radius-full);
        animation: pulse 2s infinite;
    }

    .new-chat-btn {
        width: 36px;
        height: 36px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: transparent;
        color: var(--color-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
    }

    .new-chat-btn:hover {
        background: var(--color-bg-tertiary);
        color: var(--color-text-primary);
        border-color: var(--color-primary);
    }

    .new-chat-btn svg {
        width: 18px;
        height: 18px;
    }

    .error-banner {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(239, 68, 68, 0.1);
        border-bottom: 1px solid var(--color-error);
        color: var(--color-error);
        font-size: var(--font-size-sm);
        animation: fadeIn var(--transition-normal) ease-out;
    }

    .error-banner svg {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
    }

    .error-banner span {
        flex: 1;
    }

    .dismiss-btn {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: var(--color-error);
        cursor: pointer;
        font-size: var(--font-size-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast);
    }

    .dismiss-btn:hover {
        background: rgba(239, 68, 68, 0.2);
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
