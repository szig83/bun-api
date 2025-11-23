import { sql } from 'bun';

console.log('Testing sql import...');
try {
	// Test 1: Using sql directly (assumes DATABASE_URL is set)
	console.log('Test 1: sql`SELECT 1`');
	// We need DATABASE_URL for this to work if it relies on env
	// But we can check if sql is callable
	console.log('Is sql callable?', typeof sql === 'function');
} catch (e) {
	console.error('Test 1 failed:', e);
}

console.log('Testing sql.connect...');
try {
	// Test 2: sql.connect
	if (typeof (sql as any).connect === 'function') {
		const db = (sql as any).connect({ url: process.env.DATABASE_URL || 'postgres://localhost' });
		console.log('db type:', typeof db);
		console.log('Is db callable?', typeof db === 'function');
		console.log('db keys:', Object.keys(db));
	} else {
		console.log('sql.connect is not a function');
	}
} catch (e) {
	console.error('Test 2 failed:', e);
}
