<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let disabled: boolean = false;
  export let maxLength: number = 5000;
  
  const dispatch = createEventDispatcher<{ send: string }>();
  
  let inputValue = '';
  let textareaElement: HTMLTextAreaElement;
  
  $: charCount = inputValue.length;
  $: isNearLimit = charCount > maxLength * 0.8;
  $: isAtLimit = charCount >= maxLength;
  $: canSend = inputValue.trim().length > 0 && !disabled && !isAtLimit;
  
  function handleSubmit() {
    if (!canSend) return;
    
    const message = inputValue.trim();
    dispatch('send', message);
    inputValue = '';
    
    // Reset textarea height
    if (textareaElement) {
      textareaElement.style.height = 'auto';
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
  
  function handleInput() {
    // Auto-resize textarea
    if (textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.height = Math.min(textareaElement.scrollHeight, 150) + 'px';
    }
  }
</script>

<div class="chat-input-container">
  <div class="input-wrapper">
    <textarea
      bind:this={textareaElement}
      bind:value={inputValue}
      on:keydown={handleKeydown}
      on:input={handleInput}
      placeholder="Type your message..."
      rows="1"
      maxlength={maxLength}
      {disabled}
      class="message-input"
      class:disabled
    ></textarea>
    
    <button 
      type="button"
      class="send-button"
      class:disabled={!canSend}
      disabled={!canSend}
      on:click={handleSubmit}
      aria-label="Send message"
    >
      {#if disabled}
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"/>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      {/if}
    </button>
  </div>
  
  <div class="input-footer">
    <span class="hint">Press Enter to send, Shift+Enter for new line</span>
    <span class="char-count" class:warning={isNearLimit} class:error={isAtLimit}>
      {charCount}/{maxLength}
    </span>
  </div>
</div>

<style>
  .chat-input-container {
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-light);
  }
  
  .input-wrapper {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-end;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm);
    border: 1px solid var(--color-border-light);
    transition: border-color var(--transition-fast);
  }
  
  .input-wrapper:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  .message-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    resize: none;
    min-height: 24px;
    max-height: 150px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .message-input::placeholder {
    color: var(--color-text-muted);
  }
  
  .message-input:focus {
    outline: none;
  }
  
  .message-input.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .send-button {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }
  
  .send-button:hover:not(.disabled) {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }
  
  .send-button:active:not(.disabled) {
    transform: scale(0.95);
  }
  
  .send-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-bg-tertiary);
    color: var(--color-text-muted);
  }
  
  .send-button svg {
    width: 20px;
    height: 20px;
  }
  
  .send-button .spin {
    animation: spin 1s linear infinite;
  }
  
  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-xs);
    padding: 0 var(--spacing-sm);
  }
  
  .hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }
  
  .char-count {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }
  
  .char-count.warning {
    color: var(--color-warning);
  }
  
  .char-count.error {
    color: var(--color-error);
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
