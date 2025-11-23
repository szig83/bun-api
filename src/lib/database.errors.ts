/**
 * Base database error class
 */
export class DatabaseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DatabaseError';
	}
}

/**
 * Error thrown when database configuration is invalid or missing
 */
export class DatabaseConfigError extends DatabaseError {
	constructor(message: string) {
		super(message);
		this.name = 'DatabaseConfigError';
	}
}

/**
 * Error thrown when database connection fails
 */
export class DatabaseConnectionError extends DatabaseError {
	public originalError?: Error;

	constructor(message: string, originalError?: Error) {
		super(message);
		this.name = 'DatabaseConnectionError';
		this.originalError = originalError;
	}
}
