# Admin Architecture - Relation Components

This document details the relation handling components in `src/app/admin/_components/relations/`.

## Files Covered

### Display Components
- `RelationField.tsx` - Main router component for relation display
- `RelationDropdown.tsx` - Dropdown menu with actions
- `TagList.tsx` - Tag pills display
- `RelationCount.tsx` - Count with preview
- `RelationInline.tsx` - Inline record display
- `RelationBadge.tsx` - Compact badge display
- `RelationLink.tsx` - Simple link display

### Edit Components (in `edit/` subdirectory)
- `RelationEditField.tsx` - Main router component for forms
- `RelationSelect.tsx` - Standard dropdown select
- `RelationAutocomplete.tsx` - Search-as-you-type input
- `RelationTagInput.tsx` - Multi-select with tags
- `RelationCheckbox.tsx` - Checkbox list
- `RelationDualList.tsx` - Dual list selector
- `RelationModal.tsx` - Modal-based editor
- `RelationInlineEdit.tsx` - Inline form editor

## 1. RelationField.tsx - Main Display Router

### Component Props

```typescript
interface RelationFieldProps {
  value: any
  column: DataTableColumn & {
    adminField?: AdminField
  }
  modelName: string
}
```

### Routing Logic

Routes to appropriate display component based on `relationDisplayMode`:

```typescript
switch (displayMode) {
  case 'dropdown':
    return <RelationDropdown {...props} />
  case 'tags':
    return <TagList {...props} />
  case 'count':
    return <RelationCount {...props} />
  case 'inline':
    return <RelationInline {...props} />
  case 'badge':
    return <RelationBadge {...props} />
  case 'link':
  default:
    return <RelationLink {...props} />
}
```

### Default Mode Selection

- One-to-One: `link`
- Many-to-One: `dropdown`
- One-to-Many: `count`
- Many-to-Many: `tags`

## 2. RelationDropdown.tsx - Progressive Disclosure Menu

### Features

#### Action Items
- **Filter**: Filters current table by this relation
- **View**: Navigate to related record detail
- **Edit**: Open edit form for relation
- **View All**: Show all related records (for lists)

#### Display
- Shows primary identifier (name, title, email, or id)
- Truncates long text with ellipsis
- Handles both single and multiple relations

### Implementation Details

```typescript
// Action handling
const handleFilter = () => {
  const filterParam = {
    id: `${column.relationFrom}`,
    value: Array.isArray(ids) ? ids : [ids],
    operator: 'in'
  }
  // Updates URL with filter
}

const handleView = () => {
  router.push(`/admin/${relatedModel}/${id}`)
}
```

## 3. TagList.tsx - Tag Pills Display

### Features

- Shows items as removable pills
- Overflow handling ("+N more")
- Click to navigate to record
- Configurable max display count

### Props

```typescript
interface TagListProps {
  items: Array<{ id: string | number; display: string }>
  maxDisplay?: number
  onRemove?: (id: string | number) => void
  relatedModel?: string
}
```

### Behavior

- Shows up to `maxDisplay` items (default: 3)
- Remaining items shown as "+X more" badge
- Each tag is clickable (navigates to detail)
- Remove button if `onRemove` provided

## 4. RelationCount.tsx - Count with Preview

### Features

- Shows count as badge
- Hover preview of items
- Click to view all
- Loading state support

### Preview Implementation

```typescript
// Hover preview shows first 5 items
<HoverCardContent>
  <div className="space-y-1">
    <p className="text-sm font-medium">
      {count} {relatedModel}(s)
    </p>
    {previewItems?.map(item => (
      <div key={item.id} className="text-sm text-muted-foreground">
        {item.display}
      </div>
    ))}
    {count > 5 && (
      <p className="text-sm text-muted-foreground">
        ...and {count - 5} more
      </p>
    )}
  </div>
</HoverCardContent>
```

## 5. RelationEditField.tsx - Main Edit Router

### Component Props

```typescript
interface RelationEditFieldProps {
  name: string
  value: any
  onChange: (value: any) => void
  field: AdminField
  disabled?: boolean
  error?: string
}
```

### Routing Logic

Routes based on `relationEditMode`:

```typescript
switch (editMode) {
  case 'select':
    return <RelationSelect {...props} />
  case 'autocomplete':
    return <RelationAutocomplete {...props} />
  case 'tags':
    return <RelationTagInput {...props} />
  case 'checkbox':
    return <RelationCheckbox {...props} />
  case 'duallist':
    return <RelationDualList {...props} />
  case 'modal':
    return <RelationModal {...props} />
  case 'inline':
    return <RelationInlineEdit {...props} />
}
```

### Smart Defaults

- Small datasets (<50): `select` or `checkbox`
- Large datasets: `autocomplete` or `modal`
- Many-to-many: `tags` or `duallist`

## 6. RelationSelect.tsx - Dropdown Select

### Features

- Searchable option list
- Create new option support
- Single/multi-select modes
- Async data loading

### Implementation

```typescript
// Load options on mount
useEffect(() => {
  loadOptions()
}, [])

// Search filtering
const filteredOptions = options.filter(opt =>
  opt.label.toLowerCase().includes(searchTerm.toLowerCase())
)

// Create new handler
const handleCreateNew = async () => {
  const newRecord = await createRecord(relatedModel, newData)
  onChange(newRecord.id)
}
```

## 7. RelationAutocomplete.tsx - On-Demand Search

### Features

- Debounced search (300ms)
- Server-side filtering
- Minimum 2 characters
- Loading states
- Recent selections

### Search Implementation

```typescript
// Debounced search
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchTerm.length >= 2) {
      searchRecords()
    }
  }, 300)
  return () => clearTimeout(timer)
}, [searchTerm])

// Server search
const searchRecords = async () => {
  const results = await getRecords(relatedModel, {
    where: {
      OR: searchableFields.map(field => ({
        [field]: { contains: searchTerm, mode: 'insensitive' }
      }))
    },
    take: 10
  })
  setOptions(results)
}
```

## 8. RelationTagInput.tsx - Multi-Select Tags

### Features

- Tag addition/removal
- Autocomplete suggestions
- Create new tags
- Keyboard navigation
- Drag to reorder

### Key Handlers

```typescript
// Enter key adds tag
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && inputValue) {
    e.preventDefault()
    addTag(inputValue)
  }
  // Backspace removes last tag
  if (e.key === 'Backspace' && !inputValue && tags.length) {
    removeTag(tags[tags.length - 1].id)
  }
}
```

## 9. RelationDualList.tsx - Side-by-Side Selector

### Features

- Available/selected lists
- Search both lists
- Move items between lists
- Bulk move (all/none)
- Keyboard shortcuts

### Layout

```
[Available Items]  [>>]  [Selected Items]
- Search box       [>]   - Search box
- Item list        [<]   - Item list  
- Select all       [<<]  - Clear all
```

## Integration Points

### 1. AdminField Configuration

Extended with relation-specific fields:
- `relationDisplayMode`
- `relationActions`
- `relationEditMode`
- `relationEditOptions`
- `relationLoadStrategy`

### 2. Settings UI Integration

`RelationFieldSettings.tsx` provides UI for configuring:
- Display settings tab
- Edit settings tab
- Advanced settings tab
- Preset buttons

### 3. Data Table Integration

Modified to use `RelationField` for relation columns:

```typescript
// In data-table.tsx
if (column.isRelation) {
  return <RelationField value={value} column={column} modelName={modelName} />
}
```

### 4. Form Integration

Modified to use `RelationEditField`:

```typescript
// In form-field.tsx
if (field.type === 'relation') {
  return <RelationEditField {...fieldProps} />
}
```

## Performance Considerations

### 1. Load Strategies

- **Eager**: Include in initial query
- **Lazy**: Load on first access
- **On-Demand**: User-triggered loading

### 2. Caching

- Options cached per component lifecycle
- Stale-while-revalidate pattern
- Clear cache on related updates

### 3. Pagination

- Large datasets paginated
- Virtual scrolling for long lists
- Infinite scroll in autocomplete

## Extensibility

### Adding New Display Modes

1. Create component in `relations/`
2. Add to `RelationDisplayMode` type
3. Update `RelationField` router
4. Add to settings UI options

### Adding New Edit Modes

1. Create component in `relations/edit/`
2. Add to `RelationEditMode` type
3. Update `RelationEditField` router
4. Add to settings UI options

## Best Practices

1. **Choose appropriate modes**: Match UI to data characteristics
2. **Set preview fields**: Help users identify records
3. **Limit eager loading**: Prevent N+1 queries
4. **Enable search**: For lists >20 items
5. **Test with real data**: Ensure performance at scale
