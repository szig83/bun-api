import { describe, expect, test } from 'bun:test';

const BASE_URL = 'http://localhost:3000';

describe('API Response Structure', () => {
	test('Success response structure (teszt/kacsa)', async () => {
		const response = await fetch(`${BASE_URL}/teszt/kacsa`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ foo: 'bar' })
		});

		const data = await response.json();
		console.log('Success Response (teszt/kacsa):', data);

		expect(response.status).toBe(200);
		expect(data).toHaveProperty('success', true);
		expect(data).toHaveProperty('statusCode', 200);
		expect(data).toHaveProperty('result');
		expect(data).not.toHaveProperty('errors');
		expect(data.result).toHaveProperty('message', 'POST teszt kacsa');
	});

	test('Success response structure (teszt)', async () => {
		const response = await fetch(`${BASE_URL}/teszt`, {
			method: 'GET'
		});

		const data = await response.json();
		console.log('Success Response (teszt):', data);

		expect(response.status).toBe(200);
		expect(data).toHaveProperty('success', true);
		expect(data).toHaveProperty('statusCode', 200);
		expect(data).toHaveProperty('result');
		expect(data).not.toHaveProperty('errors');
		expect(data.result).toHaveProperty('message', 'GET teszt');
	});

	test('Error response structure (404)', async () => {
		const response = await fetch(`${BASE_URL}/non/existent/endpoint`, {
			method: 'GET'
		});

		const data = await response.json();
		console.log('Error Response:', data);

		expect(response.status).toBe(404);
		expect(data).toHaveProperty('success', false);
		expect(data).toHaveProperty('statusCode', 404);
		expect(data).toHaveProperty('errors');
		expect(Array.isArray(data.errors)).toBe(true);
		expect(data.errors[0]).toHaveProperty('message', 'Endpoint not found');
	});
});
