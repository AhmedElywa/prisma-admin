# Filter System Documentation

## Overview

A comprehensive filter system has been implemented for the admin tables with full support for all Prisma filter operations and relation filters.

## Features

### 1. **Field Type Support**
Every field type has specialized filter components with appropriate operators:

- **String Fields**
  - Operators: equals, not equals, contains, starts with, ends with, in, not in, is empty, is not empty
  - Case sensitivity options: default, insensitive, sensitive
  
- **Number Fields** (Int, BigInt, Float, Decimal)
  - Operators: equals, not equals, less than, less than or equal, greater than, greater than or equal, in, not in, is empty, is not empty
  
- **Boolean Fields**
  - Operators: equals, not equals, is empty, is not empty
  
- **DateTime Fields**
  - Operators: equals, not equals, before (lt), before or on (lte), after (gt), after or on (gte), in, not in, is empty, is not empty
  
- **Enum Fields**
  - Operators: equals, not equals, in, not in, is empty, is not empty
  - Shows available enum values from the schema
  
- **JSON Fields**
  - String operations: string contains, starts with, ends with
  - Array operations: array contains, starts with, ends with
  - Comparison operations: lt, lte, gt, gte
  - Standard: equals, not equals, is empty, is not empty

### 2. **Relation Filters**
Support for filtering by related records:

- **Single Relations (One-to-One, Many-to-One)**
  - Operators: is, is not
  - Nested filters on related model fields
  
- **List Relations (One-to-Many, Many-to-Many)**
  - Operators: every, some, none
  - Nested filters on related model fields

### 3. **UI Features**

- **Filter Panel**: Accessible via the "Filters" button in the table header
- **Visual Indicators**: Active filters shown as badges below the filter button
- **Quick Remove**: Click the X on any filter badge to remove it
- **Clear All**: Remove all filters at once
- **URL Persistence**: Filters are stored in the URL for bookmarking and sharing

### 4. **Architecture**

#### Components Structure
```
src/app/admin/_components/filters/
├── types.ts              # Filter types and interfaces
├── filter-builder.ts     # Converts filters to Prisma where clauses
├── base-filter.tsx       # Base component for all filters
├── string-filter.tsx     # String-specific filtering
├── number-filter.tsx     # Number-specific filtering
├── boolean-filter.tsx    # Boolean-specific filtering
├── datetime-filter.tsx   # DateTime-specific filtering
├── enum-filter.tsx       # Enum-specific filtering
├── json-filter.tsx       # JSON-specific filtering
├── relation-filter.tsx   # Relation filtering with nested support
├── filter-group.tsx      # Manages multiple filters
├── filter-panel.tsx      # Main filter UI panel
└── index.ts             # Exports
```

#### Integration Points

1. **DataTable Component**: Enhanced to accept filter fields and display FilterPanel
2. **[model]/page.tsx**: Passes filterable fields and handles filter state from URL
3. **crud.ts**: Updated to parse FilterValue[] and build Prisma where clauses
4. **settings.ts**: Provides `getFilterableFields()` based on field permissions

### 5. **Usage Example**

Filters are automatically available on any model page where fields have `filter: true` in adminSettings.json:

```json
{
  "models": [{
    "id": "User",
    "fields": [{
      "name": "email",
      "filter": true,  // This enables filtering
      "type": "String",
      ...
    }]
  }]
}
```

### 6. **Filter URL Format**

Filters are stored in the URL as encoded JSON:
```
/admin/user?filters=%5B%7B%22field%22%3A%22email%22%2C%22operator%22%3A%22contains%22%2C%22value%22%3A%22test%22%7D%5D
```

Decoded:
```json
[{
  "field": "email",
  "operator": "contains",
  "value": "test",
  "type": "String",
  "mode": "insensitive"
}]
```

## Next Steps

The filter system is fully implemented and integrated. To extend it:

1. Add custom filter types by creating new components following the same pattern
2. Enhance relation filters with more complex nested operations
3. Add filter presets/saved filters functionality
4. Implement bulk operations on filtered results