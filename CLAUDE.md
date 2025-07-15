# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 admin panel built with React Server Components and Server Actions, providing an auto-generated admin interface for Prisma-based applications. It's part of the PalJS ecosystem and replaces the traditional GraphQL/Apollo approach with direct server-side Prisma access.

## Common Development Commands

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)

# Database Management
npm run generate         # Generate Prisma client after schema changes
npm run db:dev          # Run database migrations in development
npm run db:push         # Push schema changes without migration (dev only)
npm run db:seed         # Seed database with sample data

# Admin Setup
npm run generate:settings  # Regenerate admin settings after schema changes

# Building & Production
npm run build           # Create production build
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint

# Testing
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with interactive UI
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
   npm run db:dev
   # 3. Generate Prisma client
   npm run generate
   # 4. Regenerate admin settings
   npm run generate:settings
   ```

2. **Adding New Features**:
   - Server Components go in `/src/app/`
   - Server Actions go in `/src/lib/actions/`
   - Shared components go in `/src/components/`
   - Use shadcn/ui components where possible

3. **Testing**:
   - E2E tests cover all CRUD operations
   - Test files in `/e2e/` directory
   - Run specific test: `npx playwright test [filename]`

## Important Notes

- Always regenerate settings after schema changes
- Use Server Actions for all data mutations
- Prefer Server Components for data fetching
- Follow the existing filter component patterns for new filter types
- Maintain type safety throughout the codebase