# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 admin panel built with React Server Components and Server Actions, providing an auto-generated admin interface for Prisma-based applications. It's part of the PalJS ecosystem and replaces the traditional GraphQL/Apollo approach with direct server-side Prisma access.

## Common Development Commands

```bash
# Development
bun run dev              # Start development server (http://localhost:3000)

# Database Management
bun run generate         # Generate Prisma client after schema changes
bun run db:dev          # Run database migrations in development
bun run db:push         # Push schema changes without migration (dev only)
bun run db:seed         # Seed database with sample data

# Admin Setup
bun run generate:settings  # Regenerate admin settings after schema changes

# Building & Production
bun run build           # Create production build
bun run start           # Start production server

# Code Quality
bun run lint            # Run Biome check with auto-fix
bun run lint:check      # Run Biome check without fixes
bun run format          # Format code with Biome
bun run format:check    # Check formatting without fixes
bun run check           # Run all Biome checks with fixes
bun run check:ci        # Run Biome in CI mode

# Testing
bun run test:e2e        # Run Playwright E2E tests
bun run test:e2e:ui     # Run E2E tests with interactive UI
```

## Architecture & Code Structure

### Key Directories

- `/src/app/admin/` - Admin panel routes using Next.js App Router
  - `[model]/` - Dynamic routes for each Prisma model (list/edit/create)
  - `_components/` - Admin-specific components
  - `settings/` - Settings management interface

- `/src/lib/` - Core business logic
  - `actions/` - Server Actions for data mutations
  - `admin/` - Admin utilities and helpers
  - `prisma-client.ts` - Singleton Prisma client

- `/src/components/` - Reusable UI components
  - `ui/` - shadcn/ui components
  - Form components with automatic field type detection
  - Filter components for query building

### Key Architectural Decisions

1. **Server Components Pattern**: All data fetching happens server-side using React Server Components. No client-side GraphQL queries.

2. **Server Actions**: All mutations (create, update, delete) use Next.js Server Actions for type-safe server communication.

3. **Settings-Driven UI**: The admin interface is dynamically generated based on:
   - Prisma schema analysis
   - `adminSettings.json` configuration
   - Field-level customization options

4. **Type Safety**: Full TypeScript coverage with:
   - Generated Prisma types
   - Zod validation schemas
   - Type-safe filter construction

### Working with Relations

Relations can be displayed and edited in multiple ways:

**Display Modes**: dropdown, tags, count, inline, link, badge
**Edit Modes**: select, autocomplete, tags, dual-list, modal

Configure in `adminSettings.json` under each model's field settings.

### Filter System

The filter system supports all Prisma operators with type-safe components:
- Text filters: contains, startsWith, endsWith, etc.
- Number filters: equals, gt, lt, gte, lte
- Date filters: date range pickers
- Relation filters: nested filtering support

### Customization Points

1. **Field Renderers**: Custom display components for specific field types
2. **Form Components**: Override default form inputs per field
3. **Filter Operators**: Add custom filter logic
4. **Table Actions**: Custom row actions and bulk operations

## Development Workflow

1. **Schema Changes**:
   ```bash
   # 1. Modify prisma/schema.prisma
   # 2. Generate migration
   bun run db:dev
   # 3. Generate Prisma client
   bun run generate
   # 4. Regenerate admin settings
   bun run generate:settings
   ```

2. **Adding New Features**:
   - Server Components go in `/src/app/`
   - Server Actions go in `/src/lib/actions/`
   - Shared components go in `/src/components/`
   - Use shadcn/ui components where possible

3. **Testing**:
   - E2E tests cover all CRUD operations
   - Test files in `/e2e/` directory
   - Run specific test: `bunx playwright test [filename]`

## Important Notes

- Always regenerate settings after schema changes
- Use Server Actions for all data mutations
- Prefer Server Components for data fetching
- Follow the existing filter component patterns for new filter types
- Maintain type safety throughout the codebase

## TypeScript Guidelines

- **NEVER use `any` type**: Always use proper types, unknown, or specific type assertions
- If encountering type errors, fix them properly instead of using `any` as a workaround
- Use type inference where possible, explicit types where necessary
- Leverage Prisma's generated types for database entities

## Code Quality & Biome Rules

- **Always respect Biome rules**: Run `bun run lint` before committing
- Fix all linting issues - never bypass or ignore them
- Use `bun run check` to fix both formatting and linting issues
- Ensure code passes `bun run check:ci` before creating PRs

## Git Workflow

- **NEVER push directly to the main branch**
- Always create a new feature branch for changes
- Submit changes via Pull Request (PR) for review
- Branch naming convention: `feature/description` or `fix/description`

## Bun Usage Guidelines

This project uses Bun as the JavaScript runtime and package manager. Follow these conventions:

### Package Management
- Use `bun install` instead of `npm install`, `yarn install`, or `pnpm install`
- Use `bun add` instead of `npm install` for adding dependencies
- Use `bun run <script>` instead of `npm run`, `yarn run`, or `pnpm run`

### Runtime
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Bun automatically loads .env files, no need for dotenv package

### Testing
- Use `bun test` for running tests if implementing unit tests
- Test files should use the `bun:test` import:
  ```ts
  import { test, expect } from "bun:test";
  ```

### Development Scripts
- For TypeScript execution, use `bun` directly instead of `tsx` where applicable
- For scripts in package.json, continue using the defined commands with `bun run`

### Build Tools
- This project uses Next.js build system, so continue using `bun run build`
- For other build tasks, prefer `bun build` over webpack or esbuild