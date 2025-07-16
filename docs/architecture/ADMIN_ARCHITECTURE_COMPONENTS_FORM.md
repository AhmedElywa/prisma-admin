# Admin Architecture - Form Components

This document details the form-related components in `src/app/admin/_components/`.

## Files Covered
- `form-generator.tsx` - Automatic form generation
- `form-generator-advanced.tsx` - Advanced form with field grouping
- `form-section.tsx` - Form field sectioning
- `form-field.tsx` - Individual field rendering
- `inline-create-form.tsx` - Inline record creation
- `relation-select.tsx` - Relation field selection
- `relation-connect.tsx` - Many-to-many connections
- `relation-picker.tsx` - Dialog-based relation selector
- `json-editor.tsx` - JSON field editing
- `array-field.tsx` - Array value management

## 1. form-generator.tsx - Dynamic Form Builder

### Component Props

```typescript
interface FormGeneratorProps {
  fields: (AdminField & {
    inputType: string
    options?: string[]
    value?: any
    relatedModel?: string
  })[]
  action: (formData: FormData) => Promise<void>
  modelName: string
  submitLabel?: string
  cancelHref: string
  inModal?: boolean
}
```

### Features

#### Layout
- 2-column grid on desktop
- Full width for complex fields:
  - JSON, rich text, file upload, arrays
- Responsive single column on mobile

#### Form Structure
```tsx
<form action={action}>
  <div className="grid gap-6 md:grid-cols-2">
    {/* Field components */}
  </div>
  <div className="flex justify-end gap-2 pt-4 border-t">
    <Button>Cancel</Button>
    <Button type="submit">Submit</Button>
  </div>
</form>
```

#### Field Mapping
Maps enhanced field data to FormField components with:
- Appropriate input types
- Placeholder text
- Required status
- Default values
- Related model info

## 2. form-field.tsx - Field Component Router

### Component Props

```typescript
interface FormFieldProps {
  name: string
  label: string
  type: string
  defaultValue?: any
  required?: boolean
  options?: string[]
  placeholder?: string
  disabled?: boolean
  relatedModel?: string
  accept?: string        // File types
  multiple?: boolean     // Multi-select
  fieldType?: string     // Prisma type
  field?: AdminField     // Full metadata
  inModal?: boolean
}
```

### Input Type Routing

Routes to appropriate input based on type:

#### Basic Inputs
- `text` → Input
- `number` → Input[type="number"]
- `boolean` → Checkbox
- `datetime` → Input[type="datetime-local"]
- `textarea` → Textarea
- `select` → Select (for enums)

#### Advanced Inputs
- `relation` → RelationSelect
- `relation-many` → RelationConnect
- `json` → JsonEditor
- `richtext` → RichTextEditor
- `file` → FileUpload
- `array` → ArrayField

### Custom Renderer Support

Checks for custom field renderers first:
```typescript
if (field) {
  const customRenderer = getFieldRenderer(field)
  if (customRenderer) {
    return customRenderer({ ... })
  }
}
```

### Dynamic Imports

Heavy components loaded on-demand:
```typescript
const RelationSelect = dynamic(
  () => import('./relation-select'),
  { ssr: false }
)
```

## 3. relation-select.tsx - Single Relation Selection

### Features

#### Search-Based Selection
- Debounced search input
- Shows current selection
- Clear button (if not required)
- Loading states

#### Data Fetching
```typescript
// Search related records
const records = await searchRelatedRecords(
  relatedModel,
  searchTerm
)
```

#### Display
- Shows display fields from settings
- Falls back to id if no display value
- Disabled state support

#### Form Integration
- Stores selected ID in hidden input
- Name matches field name
- Value cleared when selection removed

## 4. relation-connect.tsx - Many-to-Many Relations

### Features

#### Dual List Interface
1. **Selected Items**: Currently connected
2. **Available Items**: Can be connected

#### Operations
- Add single item
- Remove single item  
- Search available items
- Shows count of selected

#### State Management
```typescript
// Local state for selections
const [selectedIds, setSelectedIds] = useState<string[]>()

// Sync to form as array
selectedIds.forEach((id, index) => {
  <input name={`${name}[${index}]`} value={id} />
})
```

#### UI Components
- Lists with hover states
- Plus/minus action buttons
- Search input for available
- Loading skeleton states

## 5. json-editor.tsx - JSON Field Editor

### Features

#### Editor Modes
1. **Code Mode**: Syntax highlighted textarea
2. **Visual Mode**: Tree view (planned)

#### Validation
- Real-time JSON syntax checking
- Error messages below input
- Pretty printing on blur

#### Integration
```typescript
// Parse and validate
try {
  const parsed = JSON.parse(value)
  setValue(JSON.stringify(parsed, null, 2))
  setError(null)
} catch (e) {
  setError(e.message)
}
```

#### UI States
- Valid: Normal border
- Invalid: Red border + error text
- Empty: Placeholder object/array

## 6. array-field.tsx - Array Value Editor

### Component Props
```typescript
interface ArrayFieldProps {
  name: string
  label: string
  defaultValue?: any[]
  fieldType: string  // Element type
  required?: boolean
}
```

### Features

#### Dynamic List
- Add/remove items
- Reorder with drag handles
- Index-based form names

#### Type-Specific Inputs
- String → text input
- Number → number input
- Boolean → checkbox
- DateTime → datetime input

#### Form Submission
```typescript
// Generates indexed fields
items.forEach((item, index) => {
  <input name={`${name}[${index}]`} value={item} />
})
```

#### Validation
- Min 1 item if required
- Type validation per element
- Visual feedback for errors

## Form Data Flow

### 1. Create Flow
```
Page → getFormFieldsData() → FormGenerator → FormField → Input
                                    ↓
                            Server Action → createModelRecord()
```

### 2. Update Flow
```
Page → getModelRecord() → FormGenerator → FormField → Input
                                  ↓
                          Server Action → updateModelRecord()
```

### 3. Field Enhancement
```typescript
// Server-side field preparation
const fields = await getFormFieldsData(modelName)
// Returns fields with:
// - inputType determined
// - options loaded (enums)
// - relatedModel identified
```

## Validation Strategy

### Client-Side
- HTML5 validation (required, type)
- Custom validation in components
- Real-time feedback (JSON)

### Server-Side
- Required field checking
- Type conversion validation
- Relation existence checks
- Business rule validation

## State Management

### Form State
- Uncontrolled components (FormData)
- Local state for complex fields
- Hidden inputs for structured data

### Field State
- Individual component state
- Error states per field
- Loading states for async

## Styling Patterns

### Layout
- Consistent spacing (gap-6)
- Responsive grid
- Border separation for actions

### Field Styling
- Label above input
- Error text below
- Helper text support
- Consistent heights

### States
- Disabled: opacity + cursor
- Error: red borders/text
- Loading: skeleton animation
- Focus: ring styles

## 7. form-generator-advanced.tsx - Intelligent Field Grouping

### Features

#### Smart Field Organization
Uses `groupFormFields()` utility to organize fields into sections:
- **Basic Information**: Name, title, email fields
- **Relationships**: All relation fields
- **Additional Data**: JSON, array, and other complex fields
- **System Information**: Created/updated timestamps

#### Section-Based Rendering
```typescript
const sections = groupFormFields(fields)
return (
  <>
    {sections.map(section => (
      <FormSection key={section.title} {...section}>
        {/* Renders fields in 2-column grid */}
      </FormSection>
    ))}
  </>
)
```

#### Automatic Layout
- Full-width for complex fields (JSON, rich text, arrays)
- 2-column grid for simple fields
- Responsive single column on mobile

## 8. form-section.tsx - Visual Field Grouping

### Component Props
```typescript
interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}
```

### Features
- Card-based visual separation
- Section titles and descriptions
- Consistent spacing between sections
- Collapsible sections (planned)

## 9. inline-create-form.tsx - Modal Record Creation

### Features

#### Quick Creation
- Create related records without navigation
- Automatically links to parent record
- Minimal form with essential fields only

#### Modal Integration
```typescript
interface InlineCreateFormProps {
  relatedModel: string
  parentField: string
  parentId: string | number
  onSuccess: (record: any) => void
  fields?: string[] // Specific fields to show
}
```

#### Use Cases
- Adding tags while editing a post
- Creating categories on the fly
- Quick user creation in assignments

## 10. relation-picker.tsx - Dialog Relation Selector

### Features

#### Spacious Selection UI
- Full dialog for better visibility
- Search with pagination
- Shows multiple display fields
- Preview of selected items

#### Advanced Selection
```typescript
interface RelationPickerProps {
  relatedModel: string
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  searchFields?: string[]
}
```

#### Benefits Over Dropdown
- Better for long lists
- Shows more context
- Supports complex search
- Better mobile experience

## Performance Notes

1. **Dynamic imports**: Heavy components lazy loaded
2. **Debounced search**: Prevents excessive queries
3. **Uncontrolled forms**: Better performance
4. **Server-side processing**: No client validation overhead
5. **Intelligent grouping**: Reduces visual complexity

## Accessibility

- Proper label associations
- ARIA attributes for states
- Keyboard navigation support
- Error announcements
- Loading announcements
- Section landmarks for screen readers