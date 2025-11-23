import { sql } from 'bun';
import { DatabaseConfigError, DatabaseConnectionError } from './database.errors.ts';

/**
 * Singleton Database class for managing PostgreSQL connections
 * Uses Bun's built-in SQL support
 */
export class Database {
	private static instance: Database | null = null;
	private connection: any | null = null;

	/**
	 * Private constructor to prevent direct instantiation
	 */
	private constructor() {}

	/**
	 * Get the singleton instance of the Database class
	 * @returns The singleton Database instance
	 */
	public static getInstance(): Database {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}

	/**
	 * Connect to the PostgreSQL database using environment variables
	 * Reads DATABASE_URL from environment and establishes connection
	 * @throws {DatabaseConfigError} When DATABASE_URL is missing
	 * @throws {DatabaseConnectionError} When connection fails
	 */
	public async connect(): Promise<void> {
		// Check if already connected
		if (this.connection) {
			return;
		}

		// Read DATABASE_URL from environment
		const databaseUrl = process.env.DATABASE_URL;
		console.log(databaseUrl);

		// Validate that DATABASE_URL exists
		if (!databaseUrl) {
			throw new DatabaseConfigError('DATABASE_URL environment variable is required but not set');
		}

		try {
			// Use Bun's global sql client which automatically uses DATABASE_URL
			this.connection = sql;

			// Test the connection by running a simple query
			await this.connection`SELECT 1`;
		} catch (error) {
			console.error('Original database connection error:', error);
			this.connection = null;
			throw new DatabaseConnectionError(
				'Failed to connect to database',
				error instanceof Error ? error : new Error(String(error))
			);
		}
	}

	/**
	 * Call a stored procedure with type-safe return values
	 * @template T The expected return type
	 * @param procedureName The name of the stored procedure to call
	 * @param params Optional array of parameters to pass to the procedure
	 * @returns Promise resolving to the typed result
	 * @throws {Error} When connection is not established or procedure execution fails
	 */
	public async callProcedure<T>(procedureName: string, params: any[] = []): Promise<T> {
		// Ensure connection exists
		if (!this.connection) {
			throw new Error('Database connection not established. Call connect() first.');
		}

		// Validate procedureName to prevent SQL injection
		if (!/^[a-zA-Z0-9_]+$/.test(procedureName)) {
			throw new Error('Invalid procedure name');
		}

		try {
			// Generate parameter placeholders ($1, $2, $3, ...)
			const placeholders = params.map((_, index) => `$${index + 1}`).join(', ');

			// Build the SQL query to call the stored procedure
			// We use double quotes for the procedure name to handle case sensitivity and special characters safely
			// (though we validated it to be safe characters only)
			const query = `SELECT * FROM "${procedureName}"(${placeholders})`;

			// Execute the query using Bun's sql tagged template with unsafe chunk
			// sql.unsafe allows us to pass a raw query string with parameters
			const sqlAny = sql as any;
			const result = await this.connection`${sqlAny.unsafe(query, params)}`;

			// Return the result with the specified type
			return result as T;
		} catch (error) {
			// Propagate the error to the caller
			throw error;
		}
	}

	/**
	 * Execute a general SQL query with type-safe return values
	 * @template T The expected return type
	 * @param sqlQuery The SQL query to execute
	 * @param params Optional array of parameters for parameterized queries
	 * @returns Promise resolving to the typed result
	 * @throws {Error} When connection is not established or query execution fails
	 */
	public async query<T>(sqlQuery: string, params: any[] = []): Promise<T> {
		// Ensure connection exists
		if (!this.connection) {
			throw new Error('Database connection not established. Call connect() first.');
		}

		try {
			// Execute the query using Bun's sql.unsafe
			// This allows us to support the query(string, params) signature
			const sqlAny = sql as any;
			const result = await this.connection`${sqlAny.unsafe(sqlQuery, params)}`;

			// Return the result with the specified type
			return result as T;
		} catch (error) {
			// Propagate the error to the caller
			throw error;
		}
	}

	/**
	 * Disconnect from the database and clean up resources
	 * Closes the connection and sets it to null
	 */
	public async disconnect(): Promise<void> {
		// If no connection exists, nothing to do
		if (!this.connection) {
			return;
		}

		try {
			// Close the connection if it has a close method (Bun's sql client usually handles this automatically or via .end())
			// But the type returned by sql() might not expose close/end directly in all versions.
			// We'll try to call close/end if it exists.
			if (typeof (this.connection as any).close === 'function') {
				await (this.connection as any).close();
			} else if (typeof (this.connection as any).end === 'function') {
				await (this.connection as any).end();
			}
		} catch (error) {
			// Ignore errors during close - we're cleaning up anyway
		} finally {
			// Always set connection to null, even if close fails
			this.connection = null;
		}
	}
}
