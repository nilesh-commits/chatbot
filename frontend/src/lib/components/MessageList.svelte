<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import type { Message } from '$lib/api/chat';
  import MessageBubble from './MessageBubble.svelte';
  
  export let messages: Message[] = [];
  export let isTyping: boolean = false;
  
  let container: HTMLDivElement;
  let shouldAutoScroll = true;
  
  // Check if user has scrolled up
  function handleScroll() {
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      shouldAutoScroll = scrollHeight - scrollTop - clientHeight < 100;
    }
  }
  
  // Auto-scroll to bottom when new messages arrive
  afterUpdate(() => {
    if (shouldAutoScroll && container) {
      container.scrollTop = container.scrollHeight;
    }
  });
  
  // Scroll to bottom on mount
  onMount(() => {
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
</script>

<div 
  class="message-list" 
  bind:this={container}
  on:scroll={handleScroll}
>
  {#if messages.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </div>
      <h3 class="empty-title">Welcome to TechStyle Support!</h3>
      <p class="empty-text">
        Hi! I'm your AI support assistant. Ask me about:
      </p>
      <ul class="suggestions">
        <li>📦 Shipping & Delivery</li>
        <li>↩️ Returns & Refunds</li>
        <li>🛍️ Product Information</li>
        <li>⏰ Support Hours</li>
      </ul>
    </div>
  {:else}
    {#each messages as message (message.id)}
      <MessageBubble {message} />
    {/each}
  {/if}
  
  {#if isTyping}
    <div class="typing-indicator">
      <div class="typing-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>
      <div class="typing-bubble">
        <div class="typing-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    scroll-behavior: smooth;
  }
  
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-secondary);
    animation: fadeIn var(--transition-slow) ease-out;
  }
  
  .empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-glow);
  }
  
  .empty-icon svg {
    width: 100%;
    height: 100%;
    color: white;
  }
  
  .empty-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  .empty-text {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .suggestions {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
  }
  
  .suggestions li {
    padding: var(--spacing-xs) 0;
    font-size: var(--font-size-sm);
  }
  
  .typing-indicator {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-sm);
    animation: fadeIn var(--transition-normal) ease-out;
  }
  
  .typing-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
  }
  
  .typing-avatar svg {
    width: 100%;
    height: 100%;
    color: white;
  }
  
  .typing-bubble {
    background: var(--color-ai-bubble);
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-sm);
  }
  
  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    background: var(--color-text-muted);
    border-radius: var(--radius-full);
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .dot:nth-child(1) {
    animation-delay: 0s;
  }
  
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes typing {
    0%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
