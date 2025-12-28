import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import { initDatabase, runMigrations } from './models/database';
import chatRoutes from './routes/chat';

// Create Express app
const app: Express = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/chat', chatRoutes);

// Root health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'chatbot-backend',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
    });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong. Please try again later.',
    });
});

// Start server
async function startServer(): Promise<void> {
    try {
        // Validate configuration
        validateConfig();

        // Initialize database
        await initDatabase();
        await runMigrations();

        // Start listening
        app.listen(config.port, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖 AI Chatbot Backend Server                            ║
║                                                           ║
║   Server running at: http://localhost:${config.port}              ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║                                                           ║
║   API Endpoints:                                          ║
║   • POST /api/chat/message    - Send a message            ║
║   • GET  /api/chat/:id/history - Get chat history         ║
║   • GET  /api/health          - Health check              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

export default app;
