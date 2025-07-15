# Admin Architecture - Table Components

This document details the table-related components in `src/app/admin/_components/`.

## Files Covered
- `data-table.tsx` - Main data table component
- `bulk-actions.tsx` - Bulk operations UI
- `model-header-actions.tsx` - Table header actions

## 1. data-table.tsx - Generic Data Table

### Component Props

```typescript
interface DataTableProps<T extends DataRecord = DataRecord> {
  data: T[]
  columns: DataTableColumn[]
  totalItems: number
  currentPage: number
  itemsPerPage: number
  totalPages: number
  searchValue?: string
  searchPlaceholder?: string
  modelName?: string
  canEdit?: boolean
  canDelete?: boolean
  filterFields?: FilterConfig[]
  getRelationFields?: (modelName: string) => Promise<FilterConfig[]>
  compact?: boolean
  enableBulkActions?: boolean
}
```

### Column Definition

```typescript
interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  type?: string
  relationTo?: string      // Related model name
  relationFrom?: string    // Foreign key field
  isRelation?: boolean
  isList?: boolean        // One-to-many relation
}
```

### Key Features

#### 1. Sorting
- Single column sorting
- Visual indicators (arrows)
- URL state persistence
- Sortable columns configured per field

#### 2. Pagination
- Server-side pagination
- Page size fixed per model
- First/Previous/Next/Last navigation
- Shows current range (e.g., "1-10 of 100")

#### 3. Search
- Full-text search input
- Searches string fields only
- Debounced with form submission
- Clears page to 1 on search

#### 4. Row Selection
- Checkbox per row
- Select all (current page)
- Indeterminate state
- Persists during navigation

#### 5. Actions Column
- Edit button (links to edit page)
- Delete button (with confirmation)
- Loading state during deletion

### Cell Rendering

#### Type-Based Rendering
- **boolean**: ✓ or ✗
- **date/datetime**: Localized date string
- **json**: Inline code formatting
- **array**: Comma-separated values
- **object**: Relation handling (see below)

#### Relation Rendering
Relations are rendered as clickable links:

1. **Many-to-One** (e.g., Post → Author):
   - Shows author name/email
   - Click filters current list by that relation
   - Example: Clicking author shows all posts by that author

2. **One-to-One** or detail navigation:
   - Direct link to related record
   - Shows primary display field

3. **Many-to-Many** (arrays):
   - Each item links to its detail page
   - Comma-separated list

### URL State Management

State persisted in URL params:
- `page` - Current page number
- `sort` - Sort field
- `order` - Sort direction (asc/desc)
- `search` - Search query
- `filters` - JSON-encoded filter array

### Integration Points

1. **Filter Panel**: Rendered inline when filterFields provided
2. **Bulk Actions**: Shows when rows selected
3. **Server Actions**: Delete uses crud.ts actions
4. **Custom Renderers**: Not implemented in table (TODO)

## 2. bulk-actions.tsx - Bulk Operations

### Component Props

```typescript
interface BulkActionsProps {
  selectedCount: number
  selectedIds: (string | number)[]
  modelName: string
  onClearSelection: () => void
}
```

### Features

#### 1. Selection Info
- Shows count of selected items
- Clear selection button

#### 2. Delete Operation
- Confirmation dialog
- Shows count in confirmation
- Loading state during operation
- Clears selection on complete

#### 3. Export Operations
- CSV export
- JSON export  
- Downloads via blob URL
- Filename includes model and timestamp

### Export Implementation

```typescript
// CSV Export
const csvData = await exportRecords(modelName, selectedIds, 'csv')
downloadFile(csvData, `${modelName}-export.csv`, 'text/csv')

// JSON Export  
const jsonData = await exportRecords(modelName, selectedIds, 'json')
downloadFile(jsonData, `${modelName}-export.json`, 'application/json')
```

### UI States

1. **Default**: Shows action buttons
2. **Confirming**: Delete confirmation dialog
3. **Loading**: Disabled state during operations
4. **Error**: Toast notifications on failure

## 3. model-header-actions.tsx - Table Header Actions

### Component Props

```typescript
interface ModelHeaderActionsProps {
  modelName: string
  canCreate: boolean
}
```

### Features

#### 1. Create Button
- Conditional based on permissions
- Links to `/admin/[model]/new`
- Primary button style

#### 2. Import/Export Menu
- Dropdown menu with:
  - Import from CSV
  - Export all as CSV
  - Export all as JSON
- Uses DropdownMenu from shadcn/ui

#### 3. Import Dialog
Triggered from dropdown, includes:
- File upload input
- CSV preview table
- Column mapping interface
- Skip header row option
- Progress feedback

#### 4. Export All
- Exports entire model (no selection)
- Same implementation as bulk export
- Immediate download

### Import Dialog Flow

1. **File Selection**: User uploads CSV
2. **Preview**: Shows first 5 rows
3. **Mapping**: Map CSV columns to fields
4. **Import**: Process with progress
5. **Results**: Success/error summary

## Component Interactions

### Data Flow
```
Page → DataTable → BulkActions
              ↓
         FilterPanel
              ↓
     Server Actions (CRUD)
```

### Selection Management
1. DataTable manages selection state
2. Passes to BulkActions when > 0 selected
3. BulkActions triggers operations
4. Clears selection on complete

### URL Synchronization
1. All state changes update URL
2. Page reads initial state from URL
3. Browser back/forward works
4. Shareable filtered views

## Styling Notes

- Uses Tailwind CSS classes
- Responsive design with sm: breakpoints
- Compact mode for dense displays
- Loading states with opacity/cursor
- Error states with red colors

## Performance Considerations

1. **Server-side operations**: All data operations
2. **No client-side filtering**: Prevents large DOM
3. **Pagination**: Limits rendered rows
4. **React keys**: Proper key usage for updates
5. **Memoization**: Not implemented (TODO)

## Future Enhancements

1. **Column resizing**: Draggable column widths
2. **Column visibility**: Show/hide columns
3. **Multi-column sort**: Sort by multiple fields
4. **Virtual scrolling**: For large datasets
5. **Custom cell renderers**: Use registered renderers
6. **Keyboard navigation**: Arrow key support