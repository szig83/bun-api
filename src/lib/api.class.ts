export interface ApiContext {
	params: Record<string, any>;
	query: Record<string, any>;
	body: any;
	request: Request;
	headers: Record<string, string | string[]>;
	set: any;
}

export default class Api {
	public method: string;
	public params: Record<string, any>;
	public query: Record<string, any>;
	public body: any;
	public headers: Record<string, string>;
	public urlParams: Record<string, string>;
	public responseCode: number = 200;
	public errors: Array<{ statusCode: number; message: string }> = [];
	public result: Record<string, any> = {};

	constructor(context: ApiContext) {
		console.log(context);
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

	private addError(message: string, statusCode?: number): void {
		this.responseCode = statusCode ?? this.responseCode;
		this.errors.push({ statusCode: this.responseCode, message });
	}

	private getErrors(): Array<{ statusCode: number; message: string }> {
		return this.errors;
	}

	private getResult(): Record<string, any> {
		return this.result;
	}

	async loadEndpoint(): Promise<Api> {
		if (this.checkRequest()) {
			//console.log(this.urlParams['*']);
			const id = this.urlParams['*'];

			try {
				const endpointPath = `../endpoints/${id}.${this.method?.toLowerCase()}.ts`;
				console.log(endpointPath);
				const idModule = await import(endpointPath);

				if (idModule.default) {
					// Támogatás async endpointokhoz is
					this.result = await idModule.default(this.params);
				} else {
					this.addError('Endpoint has no default export', 500);
				}
			} catch (error: any) {
				// Részletesebb hibakezelés
				if (error?.code === 'MODULE_NOT_FOUND' || error?.message?.includes('Cannot find module')) {
					this.addError('Endpoint not found', 404);
				} else {
					console.error('Endpoint error:', error);
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

	getResponse(): Record<string, any> {
		return {
			statusCode: this.responseCode,
			result: this.getResult(),
			errors: this.getErrors()
		};
	}
}
