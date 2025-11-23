import { sql } from 'bun';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Test 1: Direct usage
try {
	console.log('Testing direct sql usage...');
	const result = await sql`SELECT 1 as val`;
	console.log('Direct sql result:', result);
} catch (e) {
	console.error('Direct sql failed:', e);
}

// Test 2: Client instance
try {
	console.log('Testing client instance...');
	// @ts-ignore
	const db = sql({ url: process.env.DATABASE_URL });
	console.log('db type:', typeof db);
	console.log('db prototype:', Object.getPrototypeOf(db));
	console.log('db properties:', Object.getOwnPropertyNames(Object.getPrototypeOf(db)));

	// Check if it has query method
	if (typeof (db as any).query === 'function') {
		console.log('db has query method');
	}
} catch (e) {
	console.error('Client instance creation failed:', e);
}
