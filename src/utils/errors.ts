/**
 * Utility functions for error handling
 */

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function handleError(error: unknown): { statusCode: number; message: string } {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            message: error.message
        };
    }

    if (error instanceof Error) {
        console.error('Unhandled error:', error.message);
        return {
            statusCode: 500,
            message: 'An unexpected error occurred'
        };
    }

    console.error('Unknown error:', error);
    return {
        statusCode: 500,
        message: 'An unexpected error occurred'
    };
}
