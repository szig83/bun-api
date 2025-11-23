import { parseAsync, ValiError, type BaseSchema, type BaseSchemaAsync } from 'valibot';
import { AppError, ValidationError, NotFoundError } from './errors.class.ts';

import { Logger } from './logger.class.ts';

export interface ApiContext {
	params: Record<string, any>;
	query: Record<string, any>;
	body: any;
	request: Request;
	headers: Record<string, string | string[]>;
	set: any;
}

export interface ApiResponse<T = any> {
	success: boolean;
	statusCode: number;
	result?: T;
	errors?: any;
}

export default class Api {
	public method: string;
	public params: Record<string, any>;
	public query: Record<string, any>;
	public body: any;
	public headers: Record<string, string>;
	public urlParams: Record<string, string>;
	public responseCode: number = 200;
	public errors: Array<{ statusCode: number; message: string; details?: any }> = [];
	public result: any = {};

	constructor(context: ApiContext) {
		// HTTP metódus
		this.method = context.request.method.toUpperCase();

		// URL paraméterek (pl. /:id)
		this.urlParams = context.params as Record<string, string>;

		// Query paraméterek
		this.query = context.query as Record<string, any>;

		// Request body
		this.body = context.body;

		// Headers
		this.headers = context.headers as Record<string, string>;

		// Paraméterek összegyűjtése metódus alapján
		if (this.method === 'GET') {
			this.params = { ...this.query };
		} else {
			// POST, PUT, PATCH, DELETE esetén a body-ból
			this.params = this.body || {};
		}
	}

	// Helper metódus egy adott paraméter lekérdezésére
	getParam(key: string, defaultValue?: any): any {
		return this.params[key] ?? defaultValue;
	}

	// Helper metódus URL paraméter lekérdezésére
	getUrlParam(key: string, defaultValue?: any): any {
		return this.urlParams[key] ?? defaultValue;
	}

	// Helper metódus header lekérdezésére
	getHeader(key: string, defaultValue?: string): string | undefined {
		return this.headers[key.toLowerCase()] ?? defaultValue;
	}

	private addError(message: string, statusCode: number = 500, details?: any): void {
		this.responseCode = statusCode;
		this.errors.push({ statusCode, message, details });
		Logger.error(message, details);
	}

	private getErrors(): Array<{ statusCode: number; message: string; details?: any }> {
		return this.errors;
	}

	private getResult(): any {
		return this.result;
	}

	async loadEndpoint(): Promise<Api> {
		if (this.checkRequest()) {
			const id = this.urlParams['*'];

			try {
				const endpointPath = `../endpoints/${id}.${this.method?.toLowerCase()}.ts`;
				console.log(`Loading endpoint: ${endpointPath}`);

				const idModule = await import(endpointPath);

				if (idModule.default) {
					// Validation Logic
					if (idModule.schema) {
						try {
							// Validate params against the schema using Valibot
							const schema = idModule.schema as
								| BaseSchema<any, any, any>
								| BaseSchemaAsync<any, any, any>;
							const validatedParams = await parseAsync(schema, this.params);
							// Update params with validated (and potentially transformed) data
							this.params = validatedParams;
						} catch (validationError) {
							if (validationError instanceof ValiError) {
								// Format Valibot errors
								const details = validationError.issues.map((issue) => ({
									path: issue.path?.map((p: any) => p.key).join('.') || 'unknown',
									message: issue.message
								}));
								throw new ValidationError(JSON.stringify(details));
							}
							throw validationError;
						}
					}

					// Execute endpoint
					const response: ApiResponse = await idModule.default(this.params);

					this.responseCode = response.statusCode;
					if (response.success) {
						this.result = response.result;
					} else {
						this.errors = response.errors || [];
					}
				} else {
					throw new AppError('Endpoint has no default export', 500);
				}
			} catch (error: any) {
				// Handle specific errors
				if (error instanceof AppError) {
					this.addError(error.message, error.statusCode);
				} else if (error instanceof ValiError) {
					// Should be caught above, but just in case
					this.addError('Validation Error', 400, error.issues);
				} else if (
					error?.code === 'MODULE_NOT_FOUND' ||
					error?.message?.includes('Cannot find module')
				) {
					this.addError(`Endpoint not found: ${id}, method: ${this.method}`, 404);
				} else {
					this.addError('Internal server error', 500);
				}
			}
		}
		return this;
	}

	private checkRequest(): boolean {
		const id = this.urlParams['*'];

		// Biztonsági ellenőrzés: alfanumerikus karakterek, kötőjel, aláhúzás és /
		if (!id || !/^[a-zA-Z0-9_\/-]+$/.test(id)) {
			this.addError('Invalid endpoint identifier', 400);
			return false;
		}
		return true;
	}

	getResponse(): ApiResponse {
		// If there are errors, return the first one's status code (or 500)
		// and the list of errors.
		if (this.errors.length > 0) {
			return {
				statusCode: this.responseCode, // This is usually the last error's code
				success: false,
				errors: this.errors
			};
		}

		return {
			statusCode: this.responseCode,
			success: true,
			result: this.getResult()
		};
	}
}
