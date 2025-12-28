<script lang="ts">
    import ChatWidget from "$lib/components/ChatWidget.svelte";
</script>

<svelte:head>
    <title>TechStyle Support Chat</title>
    <meta
        name="description"
        content="Get help from our AI-powered customer support assistant"
    />
</svelte:head>

<main class="app-container">
    <div class="chat-wrapper">
        <ChatWidget />
    </div>

    <footer class="app-footer">
        <p>Powered by AI • TechStyle Store</p>
    </footer>
</main>

<style>
    .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
        gap: var(--spacing-md);
    }

    .chat-wrapper {
        width: 100%;
        max-width: 480px;
        height: calc(100vh - 100px);
        max-height: 700px;
        min-height: 500px;
    }

    .app-footer {
        text-align: center;
    }

    .app-footer p {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
        margin: 0;
    }

    @media (max-width: 520px) {
        .app-container {
            padding: 0;
        }

        .chat-wrapper {
            max-width: 100%;
            height: 100vh;
            max-height: none;
            min-height: auto;
            border-radius: 0;
        }

        .app-footer {
            display: none;
        }
    }
</style>
