# Project Structure

## Directory Organization

```
src/
├── index.ts              # Application entry point, Elysia server setup
├── lib/                  # Core library code
│   └── api.class.ts      # Api class for request/response handling
└── endpoints/            # API endpoint handlers
    └── {name}.{method}.ts
```

## Architecture Patterns

### File-Based Routing

Endpoints are organized by name and HTTP method:

- Pattern: `src/endpoints/{id}.{method}.ts`
- Example: `teszt.get.ts`, `teszt.post.ts`
- Each endpoint exports a default function that receives params and returns a result object

### Endpoint Structure

```typescript
export default (params: Record<string, any>) => {
	return {
		// Your response data
	};
};
```

### Request Flow

1. All requests hit the catch-all route `/:id` in `index.ts`
2. The `Api` class extracts context (params, query, body, headers)
3. Endpoint is dynamically loaded from `src/endpoints/{id}.{method}.ts`
4. Response is formatted with `statusCode`, `result`, and `errors` fields

### Api Class Responsibilities

- Parse request context (method, params, query, body, headers)
- Dynamically load endpoint modules
- Handle errors (404 for missing endpoints)
- Format consistent JSON responses
