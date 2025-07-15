# Admin Architecture - Filter Components

This document details the filter system components in `src/app/admin/_components/filters/`.

## Files Covered
- `types.ts` - Filter type definitions
- `filter-builder.ts` - Prisma where clause builder
- `filter-panel.tsx` - Main filter UI panel
- `filter-field.tsx` - Individual filter field
- `filter-value-input.tsx` - Value input components

## 1. types.ts - Filter Type System

### Core Types

#### FilterOperator
```typescript
export type FilterOperator = 
  // Basic operators
  | 'equals' | 'not' | 'in' | 'notIn'
  | 'lt' | 'lte' | 'gt' | 'gte'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'isNull' | 'isNotNull'
  // Relation operators
  | 'is' | 'isNot' | 'every' | 'some' | 'none'
  // JSON operators
  | 'string_contains' | 'string_starts_with' | 'string_ends_with'
  | 'array_contains' | 'array_starts_with' | 'array_ends_with'
```

#### FilterValue
```typescript
export interface FilterValue {
  field: string
  operator: FilterOperator
  value: any
  type?: string
  mode?: 'insensitive' | 'sensitive' | 'default'
}
```

#### FilterConfig
```typescript
export interface FilterConfig {
  field: string
  label: string
  type: string        // Prisma type
  kind?: string       // scalar, object, enum
  list?: boolean
  relationTo?: string
  enumValues?: string[]
}
```

### Helper Functions

#### getOperatorsForType()
Returns valid operators based on field type:
- **String**: equals, contains, startsWith, etc.
- **Number**: equals, lt, gt, gte, etc.
- **Boolean**: equals, not, isNull
- **DateTime**: equals, lt, gt, date ranges
- **Relations**: is, isNot, every, some, none
- **JSON**: All operators including path queries

#### needsValue()
Determines if operator requires a value input:
- `isNull`, `isNotNull` → false
- All others → true

#### isMultiValue()
Checks if operator accepts multiple values:
- `in`, `notIn` → true
- Others → false

## 2. filter-builder.ts - Where Clause Builder

### buildPrismaWhere()

```typescript
export function buildPrismaWhere(
  filters: FilterValue[]
): WhereInput | undefined
```

Converts filter array to Prisma where clause:

#### Operator Mapping
```typescript
switch (operator) {
  case 'equals':
    where[field] = value
    break
  case 'contains':
    where[field] = { 
      contains: value,
      mode: mode || 'insensitive'
    }
    break
  case 'in':
    where[field] = { 
      in: Array.isArray(value) ? value : [value] 
    }
    break
  // ... more operators
}
```

#### Special Handling
- Null operators bypass value check
- Mode applied to string operators
- Arrays ensured for in/notIn
- Relations use nested syntax

### mergeWhereConditions()

```typescript
export function mergeWhereConditions(
  filterWhere: WhereInput | undefined,
  searchWhere: WhereInput | undefined
): WhereInput | undefined
```

Combines filter and search with AND:
```typescript
return {
  AND: [filterWhere, searchWhere]
}
```

## 3. filter-panel.tsx - Main Filter UI

### Component Structure

```typescript
interface FilterPanelProps {
  fields: FilterConfig[]
  modelName: string
  getRelationFields?: (model: string) => Promise<FilterConfig[]>
}
```

### Features

#### Filter Management
- Add/remove filters
- Auto-save to URL
- Visual indicators (badges)
- Expandable panel

#### State Management
```typescript
// Parse from URL
const [filters, setFilters] = useState<FilterValue[]>(() => {
  const param = searchParams.get('filters')
  return param ? JSON.parse(decodeURIComponent(param)) : []
})

// Auto-save to URL
useEffect(() => {
  if (filters.length > 0) {
    updateUrl({ 
      filters: encodeURIComponent(JSON.stringify(filters)) 
    })
  }
}, [filters])
```

#### UI Components
1. **Trigger Button**: Shows filter count
2. **Field List**: Available fields to filter
3. **Active Filters**: Current filter conditions
4. **Add Button**: Adds new filter

### Filter Lifecycle

1. User clicks field → Filter added with default operator
2. Filter appears in active list
3. User configures operator and value
4. Auto-saves to URL on change
5. Remove button clears individual filter

## 4. filter-field.tsx - Individual Filter

### Component Props

```typescript
interface FilterFieldProps {
  filter: FilterValue
  config: FilterConfig
  onChange: (filter: FilterValue) => void
  onRemove: () => void
  getRelationFields?: (model: string) => Promise<FilterConfig[]>
}
```

### Layout

```
[Field Label] [Operator Select] [Value Input] [Remove Button]
```

### Operator Selection
- Filtered by field type
- User-friendly labels
- Updates filter on change

### Value Input Routing
- Null operators → No input
- Multi operators → Tags input
- Relations → Nested filters
- Others → Type-specific input

## 5. filter-value-input.tsx - Value Inputs

### Component Types

#### StringFilterInput
- Text input with mode toggle
- Case sensitivity option
- Placeholder hints

#### NumberFilterInput  
- Number input with validation
- Min/max based on type
- Step for decimals

#### DateFilterInput
- DateTime local input
- Timezone handling
- Format conversion

#### BooleanFilterInput
- Dropdown with True/False/Empty
- Clear option

#### MultiValueInput
- Tag-style input
- Add/remove values
- Type-specific validation

#### RelationFilterInput
- Nested filter panel
- Recursive filtering
- Async field loading

### Input State

Each input maintains:
- Current value
- Validation state  
- Loading state (relations)
- Error messages

## Filter Application Flow

### 1. User Interaction
```
User clicks filter → Selects field → Chooses operator → Enters value
```

### 2. State Updates
```
FilterPanel state → URL params → Page re-renders → Server query
```

### 3. Query Building
```
URL filters → buildPrismaWhere() → Prisma query → Results
```

## Advanced Features

### 1. Relation Filtering
Supports deep filtering through relations:
```typescript
// Filter posts by author name
{
  field: 'author',
  operator: 'is',
  value: {
    field: 'name',
    operator: 'contains',
    value: 'John'
  }
}
```

### 2. JSON Filtering
Path-based queries for JSON fields:
```typescript
{
  field: 'metadata',
  operator: 'string_contains',
  value: 'active'
}
```

### 3. Array Filtering
Complex array operations:
```typescript
{
  field: 'tags',
  operator: 'array_contains',
  value: ['tech', 'news']
}
```

## UI/UX Patterns

### Visual Feedback
- Badge count on button
- Check icon for active
- Smooth transitions
- Loading states

### Interaction Design
- One-click field addition
- Inline editing
- Clear remove buttons
- Keyboard shortcuts

### Responsive Design
- Mobile-friendly layout
- Touch-optimized controls
- Collapsible on small screens

## Performance Optimizations

1. **URL-based state**: No client state overhead
2. **Debounced updates**: Prevents excessive rerenders
3. **Async relation loading**: Only loads when needed
4. **Memoized operators**: Computed once per type

## Known Limitations

1. **No OR conditions**: Only AND logic
2. **No grouped conditions**: Flat structure
3. **Limited JSON paths**: Basic path queries
4. **No saved filters**: Not persistent