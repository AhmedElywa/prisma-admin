# Admin Tool Architecture - Index

This document provides a comprehensive overview of the admin tool architecture. Due to the size and complexity, the documentation is split into multiple files.

## Overview

The admin tool is built with:
- **Next.js 15** with App Router
- **React Server Components** and Server Actions
- **Direct Prisma database access** (no GraphQL)
- **TypeScript** with full type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components

## Documentation Structure

### Core Library
- 📁 [ADMIN_ARCHITECTURE_CORE.md](./ADMIN_ARCHITECTURE_CORE.md) - Core library files in `src/lib/admin/`
  - Types and interfaces
  - Settings management
  - Admin configuration generator
  - Custom renderer system

### Server Actions
- 📁 [ADMIN_ARCHITECTURE_ACTIONS_CRUD.md](./ADMIN_ARCHITECTURE_ACTIONS_CRUD.md) - CRUD operations
  - List, create, update, delete operations
  - Bulk operations and exports
  - Form data processing
  
- 📁 [ADMIN_ARCHITECTURE_ACTIONS_OTHER.md](./ADMIN_ARCHITECTURE_ACTIONS_OTHER.md) - Other server actions
  - Settings management actions
  - CSV import/export functionality
  - Filter and form data helpers

### UI Components
- 📁 [ADMIN_ARCHITECTURE_COMPONENTS_TABLE.md](./ADMIN_ARCHITECTURE_COMPONENTS_TABLE.md) - Table components
  - Data table with sorting and pagination
  - Bulk actions interface
  - Model header actions

- 📁 [ADMIN_ARCHITECTURE_COMPONENTS_FORM.md](./ADMIN_ARCHITECTURE_COMPONENTS_FORM.md) - Form components
  - Dynamic form generator
  - Field routing and rendering
  - Relation selectors
  - JSON and array editors

- 📁 [ADMIN_ARCHITECTURE_COMPONENTS_FILTERS.md](./ADMIN_ARCHITECTURE_COMPONENTS_FILTERS.md) - Filter system
  - Filter types and operators
  - Filter panel UI
  - Where clause builder
  - Advanced filtering features

- 📁 [ADMIN_ARCHITECTURE_COMPONENTS_ADVANCED.md](./ADMIN_ARCHITECTURE_COMPONENTS_ADVANCED.md) - Advanced components
  - Rich text editor (TipTap)
  - File upload interface
  - CSV import dialog
  - Settings management UI

- 📁 [ADMIN_ARCHITECTURE_COMPONENTS_RELATIONS.md](./ADMIN_ARCHITECTURE_COMPONENTS_RELATIONS.md) - Relation handling components
  - Configurable display modes (dropdown, tags, count, inline, badge, link)
  - Configurable edit modes (select, autocomplete, tags, duallist, modal, inline, checkbox)
  - Smart defaults based on relation types
  - Performance optimization strategies

### Pages & Routing
- 📁 [ADMIN_ARCHITECTURE_PAGES.md](./ADMIN_ARCHITECTURE_PAGES.md) - Page structure and routing
  - Dynamic model routes
  - CRUD page implementations
  - Settings pages
  - Layout and navigation patterns

## Key Concepts

### 1. Settings-Driven Architecture
The entire admin interface is driven by `adminSettings.json`, which contains:
- Model configurations (permissions, display names)
- Field configurations (visibility, labels, types)
- Enum definitions

### 2. Generic Components
All components are model-agnostic and configured through settings:
- Single `[model]` route handles all models
- Generic CRUD actions work with any Prisma model
- Dynamic form generation based on field types

### 3. Type Safety
Full TypeScript coverage with:
- Prisma-generated types
- Custom admin types
- No `any` types in the codebase

### 4. Server-First Architecture
Leverages Next.js 15 features:
- Server Components for data fetching
- Server Actions for mutations
- Progressive enhancement
- Zero client-side state management

## Quick Start

1. **Generate Settings**: Run the generator to create `adminSettings.json` from your Prisma schema
2. **Customize Settings**: Use the Settings UI or edit JSON directly
3. **Add Custom Renderers**: Register custom field/table renderers for special cases
4. **Configure Permissions**: Set model and field-level permissions

## File Structure Overview

```
src/
├── lib/
│   ├── admin/          # Core admin library
│   │   ├── types.ts    # TypeScript interfaces
│   │   ├── settings.ts # Settings management
│   │   ├── generator.ts # Schema → Settings
│   │   └── custom-renderers.tsx
│   ├── actions/        # Server actions
│   │   ├── crud.ts     # CRUD operations
│   │   ├── import.ts   # Import/Export
│   │   └── settings.ts # Settings mutations
│   └── prisma-*.ts     # Prisma utilities
└── app/
    └── admin/
        ├── _components/  # UI components
        ├── [model]/      # Dynamic routes
        └── settings/     # Admin config
```

## Features Implemented (95%)

✅ **Core Features**
- Dynamic model management
- CRUD operations
- Filtering and sorting
- Pagination
- Search

✅ **Advanced Features**
- Relation management (1-to-1, 1-to-many, many-to-many)
- Bulk operations
- Import/Export (CSV/JSON)
- Rich text editing
- File uploads
- Array field management
- Custom field renderers

✅ **Developer Experience**
- Full TypeScript support
- Hot reload settings
- Extensible architecture
- Clean separation of concerns

## Remaining Work (5%)

❌ **Internationalization**
- Multi-language support
- RTL layouts
- Translatable labels

❌ **Performance**
- Streaming responses
- Virtual scrolling
- Optimistic updates

See individual architecture files for detailed implementation information.