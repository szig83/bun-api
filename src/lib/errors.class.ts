import { Logger } from './logger.class.ts';

export class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);

		// Auto-log the error
		if (this.statusCode >= 500) {
			Logger.error(message, this);
		} else if (this.statusCode >= 400) {
			Logger.custom('WARN', message, this);
		}
	}
}

export class ValidationError extends AppError {
	constructor(message: string = 'Validation Error') {
		super(message, 400);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = 'Not Found') {
		super(message, 404);
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string = 'Forbidden') {
		super(message, 403);
	}
}
