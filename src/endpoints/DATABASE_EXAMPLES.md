# Database Integration Examples

This directory contains example endpoints demonstrating how to integrate the Database singleton class with the API framework.

## Example Endpoints

### GET /database-example

Demonstrates calling a stored procedure that retrieves data.

**Query Parameters:**

- `user_id` (optional, default: 1) - The ID of the user to retrieve

**Example Request:**

```bash
curl http://localhost:3000/database-example?user_id=1
```

**Expected Response:**

```json
{
	"statusCode": 200,
	"result": {
		"success": true,
		"message": "Successfully called stored procedure",
		"data": [
			{
				"id": 1,
				"name": "John Doe",
				"email": "john@example.com"
			}
		],
		"example": {
			"description": "This endpoint demonstrates calling a PostgreSQL stored procedure",
			"procedure": "get_user_by_id",
			"parameters": [1],
			"note": "Make sure the stored procedure exists in your database"
		}
	},
	"errors": []
}
```

**Required Stored Procedure:**

```sql
CREATE OR REPLACE FUNCTION get_user_by_id(user_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR,
  email VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email
  FROM users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;
```

### POST /database-example

Demonstrates calling a stored procedure that creates data.

**Request Body:**

```json
{
	"name": "Jane Doe",
	"email": "jane@example.com"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/database-example \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'
```

**Expected Response:**

```json
{
	"statusCode": 200,
	"result": {
		"success": true,
		"message": "Successfully created user via stored procedure",
		"data": {
			"id": 2,
			"name": "Jane Doe",
			"email": "jane@example.com",
			"created_at": "2024-01-15T10:30:00.000Z"
		},
		"example": {
			"description": "This endpoint demonstrates calling a stored procedure with POST data",
			"procedure": "create_user",
			"parameters": {
				"name": "Jane Doe",
				"email": "jane@example.com"
			},
			"note": "Make sure the stored procedure exists in your database"
		}
	},
	"errors": []
}
```

**Required Stored Procedure:**

```sql
CREATE OR REPLACE FUNCTION create_user(
  user_name VARCHAR,
  user_email VARCHAR
)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR,
  email VARCHAR,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO users (name, email, created_at)
  VALUES (user_name, user_email, NOW())
  RETURNING id, name, email, created_at;
END;
$$ LANGUAGE plpgsql;
```

## Integration Pattern

The examples demonstrate the following integration pattern:

1. **Get Singleton Instance**: `const db = Database.getInstance()`
2. **Ensure Connection**: `await db.connect()`
3. **Call Stored Procedure**: `await db.callProcedure<T>(procedureName, params)`
4. **Handle Errors**: Wrap in try-catch and return appropriate error responses

## Key Features Demonstrated

- ✅ Singleton pattern usage
- ✅ Type-safe stored procedure calls
- ✅ Parameter passing (query params and body)
- ✅ Error handling
- ✅ Multiple parameter types
- ✅ Different return types (arrays, single objects)

## Setup Requirements

1. Set the `DATABASE_URL` environment variable:

   ```bash
   export DATABASE_URL="postgres://user:password@localhost:5432/dbname"
   ```

2. Create the required stored procedures in your PostgreSQL database (see SQL examples above)

3. Ensure you have a `users` table or modify the stored procedures to match your schema

## Testing the Examples

You can test these endpoints even without the stored procedures by observing the error handling:

```bash
# Test GET endpoint
curl http://localhost:3000/database-example

# Test POST endpoint
curl -X POST http://localhost:3000/database-example \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

The endpoints will return helpful error messages if the stored procedures don't exist or if the database connection fails.
