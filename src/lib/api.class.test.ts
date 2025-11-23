import { describe, test, expect, mock } from 'bun:test';
import Api, { type ApiContext } from './api.class';
import * as v from 'valibot';

// Mock endpoint module
const mockEndpoint = {
	default: async (params: any) => ({ success: true, params }),
	schema: v.object({
		name: v.string(),
		age: v.number()
	})
};

// Mock import to return our mock endpoint
mock.module('../endpoints/test.post.ts', () => mockEndpoint);

describe('Api Class Validation', () => {
	test('should validate valid parameters successfully', async () => {
		const context: ApiContext = {
			request: new Request('http://localhost/test', { method: 'POST' }),
			params: { '*': 'test' },
			query: {},
			body: { name: 'John', age: 30 },
			headers: {},
			set: {}
		};

		const api = new Api(context);
		await api.loadEndpoint();

		const response = api.getResponse();
		expect(response.statusCode).toBe(200);
		expect(response.success).toBe(true);
		expect(response.result.params).toEqual({ name: 'John', age: 30 });
	});

	test('should fail validation for invalid parameters', async () => {
		const context: ApiContext = {
			request: new Request('http://localhost/test', { method: 'POST' }),
			params: { '*': 'test' },
			query: {},
			body: { name: 'John', age: 'invalid' }, // age should be number
			headers: {},
			set: {}
		};

		const api = new Api(context);
		await api.loadEndpoint();

		const response = api.getResponse();
		expect(response.statusCode).toBe(400);
		expect(response.success).toBe(false);
		const errorDetails = JSON.parse(response.errors[0].message);
		expect(errorDetails[0].path).toBe('age');
		// Check details if possible, but structure depends on Valibot version and our formatting
	});

	test('should fail validation for missing required parameters', async () => {
		const context: ApiContext = {
			request: new Request('http://localhost/test', { method: 'POST' }),
			params: { '*': 'test' },
			query: {},
			body: { name: 'John' }, // age missing
			headers: {},
			set: {}
		};

		const api = new Api(context);
		await api.loadEndpoint();

		const response = api.getResponse();
		expect(response.statusCode).toBe(400);
		expect(response.success).toBe(false);
	});
});
