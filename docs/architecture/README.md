# Admin Tool Architecture Documentation

This folder contains comprehensive documentation of the admin tool architecture for the Prisma Admin rewrite from GraphQL/Apollo to React Server Components with direct Prisma access.

## Files

- `ADMIN_ARCHITECTURE.md` - Main index and overview
- `ADMIN_ARCHITECTURE_CORE.md` - Core library documentation (types, settings, generator)
- `ADMIN_ARCHITECTURE_ACTIONS_CRUD.md` - CRUD server actions
- `ADMIN_ARCHITECTURE_ACTIONS_OTHER.md` - Other server actions (settings, import/export)
- `ADMIN_ARCHITECTURE_COMPONENTS_TABLE.md` - Table components
- `ADMIN_ARCHITECTURE_COMPONENTS_FORM.md` - Form components
- `ADMIN_ARCHITECTURE_COMPONENTS_FILTERS.md` - Filter system
- `ADMIN_ARCHITECTURE_COMPONENTS_ADVANCED.md` - Advanced components
- `ADMIN_ARCHITECTURE_COMPONENTS_RELATIONS.md` - Relation handling components
- `ADMIN_ARCHITECTURE_PAGES.md` - Pages and routing

## Usage

### In New Claude Chats

Use the slash command `/admin-architecture` to load this documentation into your conversation context.

### Manual Reading

You can also manually read specific files based on what you're working on:
- Working on CRUD operations? Read `ADMIN_ARCHITECTURE_ACTIONS_CRUD.md`
- Building forms? Read `ADMIN_ARCHITECTURE_COMPONENTS_FORM.md`
- Understanding the filter system? Read `ADMIN_ARCHITECTURE_COMPONENTS_FILTERS.md`

## Purpose

This documentation serves as a comprehensive reference for:
- Understanding the current implementation
- Making consistent architectural decisions
- Onboarding new developers
- Providing context to AI assistants

Last updated: January 2025 (95% feature complete)