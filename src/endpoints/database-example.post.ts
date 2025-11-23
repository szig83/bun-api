import * as v from 'valibot';
import { Database } from '../lib/database.class.ts';
import type { ApiResponse } from '../lib/api.class.ts';

/**
 * Example POST endpoint demonstrating Database singleton usage with parameters
 *
 * This endpoint shows how to:
 * 1. Accept parameters from request body
 * 2. Call a stored procedure with multiple parameters
 * 3. Handle different return types (aggregate results)
 *
 * Example stored procedure this endpoint expects:
 *
 * CREATE OR REPLACE FUNCTION create_user(
 *   user_name VARCHAR,
 *   user_email VARCHAR
 * )
 * RETURNS TABLE (
 *   id INTEGER,
 *   name VARCHAR,
 *   email VARCHAR,
 *   created_at TIMESTAMP
 * ) AS $$
 * BEGIN
 *   RETURN QUERY
 *   INSERT INTO users (name, email, created_at)
 *   VALUES (user_name, user_email, NOW())
 *   RETURNING id, name, email, created_at;
 * END;
 * $$ LANGUAGE plpgsql;
 */

interface CreateUserResult {
	id: number;
	name: string;
	email: string;
	created_at: string;
}

// Define Valibot schema for validation
export const schema = v.object({
	name: v.string(),
	email: v.pipe(v.string(), v.email())
});

// Infer type from schema
type Params = v.InferOutput<typeof schema>;

export default async (params: Params): Promise<ApiResponse> => {
	console.log(params);
	try {
		// Get the singleton Database instance
		const db = Database.getInstance();

		// Ensure connection is established
		await db.connect();

		// Extract parameters from validated params
		const { name, email } = params;

		// Call the stored procedure with multiple parameters
		const result = await db.callProcedure<CreateUserResult[]>('create_user', [name, email]);
		console.log(result);
		// Return the result
		return {
			success: true,
			statusCode: 200,
			result: {
				message: 'Successfully created user via stored procedure',
				data: result[0] || null,
				example: {
					description: 'This endpoint demonstrates calling a stored procedure with POST data',
					procedure: 'create_user',
					parameters: { name, email },
					note: 'Make sure the stored procedure exists in your database'
				}
			}
		};
	} catch (error) {
		// Handle errors appropriately
		return {
			success: false,
			statusCode: 500,
			errors: [
				{
					message: 'Failed to execute database operation',
					details: {
						error: error instanceof Error ? error.message : String(error),
						hint: 'Ensure DATABASE_URL is set and the stored procedure exists'
					}
				}
			]
		};
	}
};
