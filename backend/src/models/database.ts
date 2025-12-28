import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { Conversation, Message, MessageSender } from '../types';

// Create connection pool
const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<void> {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
        text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
      ON messages(conversation_id);
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(created_at);
    `);

        console.log('✅ Database migrations completed');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Create a new conversation
 */
export async function createConversation(): Promise<Conversation> {
    const result = await pool.query<Conversation>(
        'INSERT INTO conversations DEFAULT VALUES RETURNING *'
    );
    return result.rows[0];
}

/**
 * Get a conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | null> {
    const result = await pool.query<Conversation>(
        'SELECT * FROM conversations WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
}

/**
 * Update conversation timestamp
 */
export async function updateConversationTimestamp(id: string): Promise<void> {
    await pool.query(
        'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
        [id]
    );
}

/**
 * Create a new message
 */
export async function createMessage(
    conversationId: string,
    sender: MessageSender,
    text: string
): Promise<Message> {
    const result = await pool.query<Message>(
        `INSERT INTO messages (conversation_id, sender, text) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
        [conversationId, sender, text]
    );

    // Update conversation timestamp
    await updateConversationTimestamp(conversationId);

    return result.rows[0];
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
    conversationId: string,
    limit?: number
): Promise<Message[]> {
    let query = `
    SELECT * FROM messages 
    WHERE conversation_id = $1 
    ORDER BY created_at ASC
  `;
    const params: (string | number)[] = [conversationId];

    if (limit) {
        query = `
      SELECT * FROM (
        SELECT * FROM messages 
        WHERE conversation_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      ) sub ORDER BY created_at ASC
    `;
        params.push(limit);
    }

    const result = await pool.query<Message>(query, params);
    return result.rows;
}

/**
 * Get conversation with messages
 */
export async function getConversationWithMessages(
    conversationId: string
): Promise<{ conversation: Conversation; messages: Message[] } | null> {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
        return null;
    }

    const messages = await getMessages(conversationId);
    return { conversation, messages };
}

/**
 * Close database pool
 */
export async function closeDatabase(): Promise<void> {
    await pool.end();
    console.log('Database pool closed');
}

export { pool };
