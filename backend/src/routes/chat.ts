import { Router, Request, Response } from 'express';
import { handleChatMessage, getChatHistory } from '../services/chat.service';
import { SendMessageRequest } from '../types';

const router = Router();

/**
 * POST /api/chat/message
 * Send a message and get AI reply
 */
router.post('/message', async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, sessionId } = req.body as SendMessageRequest;

        // Validate request body
        if (!message || typeof message !== 'string') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Message is required and must be a string',
            });
            return;
        }

        if (message.trim().length === 0) {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Message cannot be empty',
            });
            return;
        }

        // Handle the message
        const result = await handleChatMessage(message, sessionId);

        res.json(result);
    } catch (error) {
        console.error('Error in POST /chat/message:', error);

        if (error instanceof Error) {
            // Known validation errors
            if (error.message.includes('empty') || error.message.includes('required')) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: error.message,
                });
                return;
            }
        }

        // Unexpected errors
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong. Please try again later.',
        });
    }
});

/**
 * GET /api/chat/:sessionId/history
 * Get conversation history for a session
 */
router.get('/:sessionId/history', async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Session ID is required',
            });
            return;
        }

        const result = await getChatHistory(sessionId);
        res.json(result);
    } catch (error) {
        console.error('Error in GET /chat/:sessionId/history:', error);

        if (error instanceof Error) {
            if (error.message === 'Invalid session ID') {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid session ID format',
                });
                return;
            }

            if (error.message === 'Conversation not found') {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Conversation not found',
                });
                return;
            }
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong. Please try again later.',
        });
    }
});

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response): void => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
