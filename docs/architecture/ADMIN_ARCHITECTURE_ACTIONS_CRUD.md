# Admin Architecture - CRUD Server Actions

This document details the CRUD operations in `src/lib/actions/crud.ts`.

## Overview

The CRUD actions provide generic database operations that work with any Prisma model based on the admin settings configuration.

## Core Functions

### 1. getModelData() - List Records

```typescript
export async function getModelData(
  modelName: string,
  options: QueryOptions = {}
)
```

**Purpose**: Fetches paginated records with filtering, sorting, and search.

**Features**:
- Pagination with page/perPage options
- Single column sorting
- Text search across string fields
- Complex filtering (supports all Prisma operators)
- Automatic relation loading based on display fields

**Process**:
1. Loads model settings and table fields
2. Builds Prisma select object including relations
3. Constructs where clause from filters and search
4. Executes paginated query
5. Returns data with pagination metadata

### 2. getModelRecord() - Get Single Record

```typescript
export async function getModelRecord(
  modelName: string,
  id: string | number
)
```

**Purpose**: Fetches a single record by ID for viewing/editing.

**Features**:
- Automatic ID type conversion (string/number)
- Loads all update fields
- Includes related data based on settings

### 3. createModelRecord() - Create Record

```typescript
export async function createModelRecord(
  modelName: string,
  formData: FormData
)
```

**Purpose**: Creates a new record from form data.

**Features**:
- Permission checking (canCreateModel)
- Type conversion based on field types
- Relation handling with connect syntax
- Array field support
- File upload placeholder
- Validation for required fields

**Field Type Handling**:
- **Numbers**: parseInt/parseFloat conversion
- **Booleans**: 'true'/'on' → boolean
- **Dates**: String → Date object
- **JSON**: JSON.parse with error handling
- **Relations**: Uses Prisma connect syntax
- **Arrays**: Handles indexed form fields

### 4. updateModelRecord() - Update Record

```typescript
export async function updateModelRecord(
  modelName: string,
  id: string | number,
  formData: FormData
)
```

**Purpose**: Updates existing record from form data.

**Features**:
- Permission checking (canUpdateModel)
- Same type conversion as create
- Relation updates with connect/disconnect
- Many-to-many with set operation
- Preserves unchanged fields

**Special Handling**:
- Empty optional relations disconnect
- Many-to-many relations use set (replaces all)
- Arrays fully replace existing values

### 5. deleteModelRecord() - Delete Single Record

```typescript
export async function deleteModelRecord(
  modelName: string,
  id: string | number
)
```

**Purpose**: Deletes a single record by ID.

**Features**:
- Permission checking (canDeleteModel)
- ID type conversion
- Path revalidation

### 6. deleteModelRecords() - Bulk Delete

```typescript
export async function deleteModelRecords(
  modelName: string,
  ids: (string | number)[]
)
```

**Purpose**: Deletes multiple records by IDs.

**Features**:
- Batch deletion with deleteMany
- ID type conversion for all IDs
- Single revalidation after all deletes

### 7. exportRecords() - Export Data

```typescript
export async function exportRecords(
  modelName: string,
  ids: (string | number)[],
  format: 'csv' | 'json'
): Promise<string>
```

**Purpose**: Exports selected records in CSV or JSON format.

**Features**:
- Filters to readable scalar fields only
- CSV escaping for special characters
- JSON pretty printing
- DateTime ISO formatting
- Null/undefined handling

## Helper Functions

### buildSelect() - Prisma Select Object

```typescript
async function buildSelect(
  modelName: string, 
  fields: AdminField[]
)
```

Creates Prisma select object:
- Includes scalar/enum fields
- For relations, includes ID + display fields
- Handles both single and list relations

### buildWhere() - Filter Conditions

```typescript
function buildWhere(
  filters?: Record<string, any> | FilterValue[]
): WhereInput | undefined
```

Supports two formats:
1. Legacy object format (simple contains)
2. New array format with operators

### buildOrderBy() - Sort Configuration

```typescript
function buildOrderBy(
  sortField?: string, 
  sortOrder?: 'asc' | 'desc'
): OrderByInput | undefined
```

Simple single-column sorting.

## Form Data Processing

### Type Conversion Rules

1. **Integers** (Int, BigInt): `parseInt()`
2. **Decimals** (Float, Decimal): `parseFloat()`
3. **Booleans**: 'true' or 'on' → true
4. **Dates**: `new Date(string)`
5. **JSON**: `JSON.parse()` with try/catch
6. **Files**: Placeholder path (needs S3/CDN integration)

### Relation Handling

**One-to-Many (create/update)**:
```typescript
data[field.name] = {
  connect: { id: value }
}
```

**Many-to-Many (create)**:
```typescript
data[field.name] = {
  connect: values.map(v => ({ id: v }))
}
```

**Many-to-Many (update)**:
```typescript
data[field.name] = {
  set: values.map(v => ({ id: v }))  // Replaces all
}
```

### Array Fields

Processes indexed form fields:
- `field[0]`, `field[1]`, etc.
- Continues until null value found
- Applies type conversion to each element

## Revalidation

All mutations trigger Next.js revalidation:
- List page after create/update/delete
- Detail page after update
- Uses `revalidatePath()` from next/cache

## Error Handling

- Permission errors throw with descriptive messages
- Type conversion errors propagate up
- Missing required fields throw validation errors
- File operations logged but don't fail (placeholder)

## Integration with Settings

All operations respect admin settings:
- Model-level permissions (create, update, delete)
- Field-level permissions (which fields to include)
- Display fields for relations
- ID field configuration

## Usage Example

```typescript
// In a Server Action
export async function createUser(formData: FormData) {
  'use server'
  await createModelRecord('User', formData)
  redirect('/admin/user')
}

// In a page
const data = await getModelData('User', {
  page: 1,
  perPage: 20,
  orderBy: 'createdAt',
  order: 'desc',
  search: 'john',
  filters: [
    { field: 'role', operator: 'equals', value: 'ADMIN' }
  ]
})
```