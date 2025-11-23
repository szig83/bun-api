import * as v from 'valibot';
import { Database } from '../lib/database.class.ts';
import type { ApiResponse } from '../lib/api.class.ts';

/**
 * Example endpoint demonstrating Database singleton usage
 *
 * This endpoint shows how to:
 * 1. Get the Database singleton instance
 * 2. Ensure connection is established
 * 3. Call a stored procedure with typed results
 * 4. Handle errors appropriately
 *
 * Example stored procedure this endpoint expects:
 *
 * CREATE OR REPLACE FUNCTION get_user_by_id(user_id INTEGER)
 * RETURNS TABLE (
 *   id INTEGER,
 *   name VARCHAR,
 *   email VARCHAR
 * ) AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT u.id, u.name, u.email
 *   FROM users u
 *   WHERE u.id = user_id;
 * END;
 * $$ LANGUAGE plpgsql;
 */

interface User {
	id: number;
	name: string;
	email: string;
}

// Define Valibot schema for validation and transformation
export const schema = v.object({
	// Transform string input (from query params) to number, default to 1
	user_id: v.optional(
		v.pipe(
			v.union([v.string(), v.number()]),
			v.transform((input) => Number(input)),
			v.integer()
		),
		1
	)
});

// Infer type from schema
type Params = v.InferOutput<typeof schema>;

export default async (params: Params): Promise<ApiResponse> => {
	try {
		// Get the singleton Database instance
		const db = Database.getInstance();

		// Ensure connection is established
		await db.connect();

		// Extract user_id from validated parameters
		const { user_id } = params;

		// Call the stored procedure with typed result
		// This demonstrates calling a stored procedure that returns user data
		const users = await db.callProcedure<User[]>('get_user_by_id', [user_id]);

		// Return the result
		return {
			success: true,
			statusCode: 200,
			result: {
				message: 'Successfully called stored procedure',
				data: users,
				example: {
					description: 'This endpoint demonstrates calling a PostgreSQL stored procedure',
					procedure: 'get_user_by_id',
					parameters: [user_id],
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
