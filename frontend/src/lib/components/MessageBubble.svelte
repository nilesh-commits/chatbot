<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Message } from '$lib/api/chat';
  
  export let message: Message;
  
  const dispatch = createEventDispatcher();
  
  $: isUser = message.sender === 'user';
  $: formattedTime = formatTime(message.timestamp);
  
  function formatTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  }
</script>

<div class="message-wrapper" class:user={isUser} class:ai={!isUser}>
  <div class="message-container">
    {#if !isUser}
      <div class="avatar ai-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>
    {/if}
    
    <div class="message-content">
      <div class="bubble" class:user-bubble={isUser} class:ai-bubble={!isUser}>
        <p class="text">{message.text}</p>
      </div>
      <span class="timestamp">{formattedTime}</span>
    </div>
    
    {#if isUser}
      <div class="avatar user-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    {/if}
  </div>
</div>

<style>
  .message-wrapper {
    display: flex;
    margin-bottom: var(--spacing-md);
    animation: fadeIn var(--transition-normal) ease-out;
  }
  
  .message-wrapper.user {
    justify-content: flex-end;
  }
  
  .message-wrapper.ai {
    justify-content: flex-start;
  }
  
  .message-container {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-sm);
    max-width: 85%;
  }
  
  .avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
  }
  
  .avatar svg {
    width: 100%;
    height: 100%;
  }
  
  .ai-avatar {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: white;
  }
  
  .user-avatar {
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
  }
  
  .message-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .message-wrapper.user .message-content {
    align-items: flex-end;
  }
  
  .message-wrapper.ai .message-content {
    align-items: flex-start;
  }
  
  .bubble {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-lg);
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.5;
  }
  
  .user-bubble {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
    color: white;
    border-bottom-right-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
  }
  
  .ai-bubble {
    background: var(--color-ai-bubble);
    color: var(--color-text-primary);
    border-bottom-left-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
  }
  
  .text {
    margin: 0;
    font-size: var(--font-size-sm);
    white-space: pre-wrap;
  }
  
  .timestamp {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    padding: 0 var(--spacing-xs);
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
</style>
