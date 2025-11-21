# Technology Stack

## Runtime & Build System

- **Runtime**: Bun (v1.3.2+)
- **Package Manager**: Bun (use `bun` commands, NOT npm/yarn/pnpm/node)
- **Language**: TypeScript with strict mode enabled

## Frameworks & Libraries

- **Web Framework**: Elysia v1.4.16
- **Code Formatting**: Prettier v3.6.2

## Common Commands

```bash
# Install dependencies
bun install

# Development (with hot reload)
bun run dev

# Build for production
bun run build

# Run production build
bun run start

# Run tests
bun run test
```

## TypeScript Configuration

- Target: ESNext with bundler module resolution
- Strict mode enabled with additional safety checks
- No emit mode (Bun handles transpilation)
- Allows importing `.ts` extensions directly
