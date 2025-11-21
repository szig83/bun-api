# Product Overview

A lightweight, dynamic API framework built on Bun and Elysia. The system uses a file-based routing pattern where endpoints are automatically loaded based on URL paths and HTTP methods.

## Key Features

- Dynamic endpoint loading: Routes are resolved from `src/endpoints/{id}.{method}.ts` files
- Unified request handling: All HTTP methods (GET, POST, etc.) are processed through a single route handler
- Structured response format: Consistent JSON responses with `statusCode`, `result`, and `errors` fields
