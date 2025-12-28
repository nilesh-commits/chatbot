import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chatbot',
    openaiApiKey: process.env.OPENAI_API_KEY || '',

    // LLM Configuration
    llm: {
        model: 'gpt-4o-mini',
        maxTokens: 500,
        temperature: 0.7,
        maxHistoryMessages: 10,
        maxMessageLength: 5000,
        timeoutMs: 30000,
    },

    // Validation
    validation: {
        minMessageLength: 1,
        maxMessageLength: 5000,
    }
};

// Validate required environment variables
export function validateConfig(): void {
    if (!config.openaiApiKey) {
        console.warn('⚠️  WARNING: OPENAI_API_KEY is not set. LLM features will not work.');
    }
    if (!config.databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required');
    }
}
