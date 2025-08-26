import { NextFunction, Request, Response } from 'express';

export interface ApiError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    error: ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const { statusCode = 500, message } = error;

    console.error('API Error:', {
        statusCode,
        message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
        success: false,
        error: {
            message: message || 'Internal Server Error',
            statusCode,
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method
        }
    });
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.url} not found`,
            statusCode: 404,
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method
        }
    });
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
