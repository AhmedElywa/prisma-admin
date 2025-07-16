# Admin Architecture - Core Library

This document details the core library files in `src/lib/admin/`.

## Directory Structure
```
src/lib/admin/
├── types.ts              # Core TypeScript interfaces
├── settings.ts           # Settings management and helpers
├── generator.ts          # Prisma schema to settings generator
├── custom-renderers.tsx  # Custom field/table renderer system
├── form-utils.ts         # Form field utilities
├── relation-validation.ts # Relation configuration validation
└── relation-helpers.ts   # Relation query helpers
```

## 1. types.ts - Core Type Definitions

### AdminSettings Interface
```typescript
export interface AdminSettings {
  models: AdminModel[]    // All Prisma models
  enums: EnumType[]      // All Prisma enums
}
```

### AdminModel Interface
```typescript
export interface AdminModel {
  id: string              // Prisma model name (e.g., "User")
  name: string            // Display name (e.g., "Users")
  idField: string         // Primary key field name
  displayFields: string[] // Fields shown in relations/lists
  create: boolean         // Allow creation
  update: boolean         // Allow updates
  delete: boolean         // Allow deletion
  fields: AdminField[]    // All model fields
}
```

### AdminField Interface
```typescript
export interface AdminField {
  // Identification
  id: string              // Unique ID: "Model.field"
  name: string            // Prisma field name
  title: string           // Display label
  
  // Type Information
  type: string            // Prisma type (String, Int, etc.)
  kind: string            // Field kind (scalar, object, enum)
  list: boolean           // Is array field
  
  // Database Constraints
  required: boolean       // Is required field
  isId: boolean          // Is primary key
  unique: boolean        // Has unique constraint
  
  // Display
  order: number          // Display order in forms/tables
  
  // Relations
  relationField?: boolean // Is relation field
  relationFrom?: string   // Foreign key field
  relationTo?: string     // Related model field
  relationName?: string   // Prisma relation name
  
  // Permissions
  read: boolean          // Show in views
  filter: boolean        // Allow filtering
  sort: boolean          // Allow sorting
  create: boolean        // Include in create forms
  update: boolean        // Include in update forms
  
  // Advanced
  editor: boolean        // Use rich text editor
  upload: boolean        // Enable file upload
  customRenderer?: string // Custom renderer key
  
  // Relation Configuration
  relationDisplayMode?: 'dropdown' | 'tags' | 'count' | 'inline' | 'badge' | 'link'
  relationActions?: Array<'filter' | 'view' | 'edit' | 'viewAll'>
  relationEditMode?: 'select' | 'autocomplete' | 'tags' | 'duallist' | 'modal' | 'inline' | 'checkbox'
  relationEditOptions?: {
    searchable?: boolean
    createable?: boolean
    maxDisplay?: number
    previewFields?: string[]
  }
  relationLoadStrategy?: 'eager' | 'lazy' | 'ondemand'
}
```

### Supporting Types
```typescript
export interface EnumType {
  name: string
  fields: string[]
}

export interface QueryOptions {
  page?: number
  perPage?: number
  orderBy?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any> | FilterValue[]
}

export interface FormField extends AdminField {
  value?: any
  error?: string
}
```

## 2. settings.ts - Settings Management

### Core Functions

#### getAdminSettings()
```typescript
// Cached function to load settings from adminSettings.json
export const getAdminSettings = cache(async (): Promise<AdminSettings>)
```

#### Model Queries
```typescript
// Get settings for a specific model
export async function getModelSettings(modelName: string): Promise<AdminModel | null>

// Get all models
export async function getAllModels(): Promise<AdminModel[]>
```

#### Field Queries
```typescript
// Get specific field settings
export async function getFieldSettings(
  modelName: string, 
  fieldName: string
): Promise<AdminField | null>

// Get fields for different contexts
export async function getTableFields(modelName: string): Promise<AdminField[]>
export async function getCreateFields(modelName: string): Promise<AdminField[]>
export async function getUpdateFields(modelName: string): Promise<AdminField[]>
export async function getFilterableFields(modelName: string): Promise<AdminField[]>
export async function getSortableFields(modelName: string): Promise<AdminField[]>
```

#### Permission Checks
```typescript
export async function canCreateModel(modelName: string): Promise<boolean>
export async function canUpdateModel(modelName: string): Promise<boolean>
export async function canDeleteModel(modelName: string): Promise<boolean>
export async function canReadModel(modelName: string): Promise<boolean>
```

#### Display Helpers
```typescript
// Get display value for a record using displayFields
export async function getDisplayValue(
  modelName: string,
  record: any
): Promise<string>

// Determine input type for a field
export async function getFieldInputType(
  field: AdminField, 
  modelName?: string
): Promise<string>

// Get column type for data table
export function getColumnType(field: AdminField): string
```

#### Settings Persistence
```typescript
// Update settings file
export async function updateAdminSettings(settings: AdminSettings): Promise<void>
```

## 3. generator.ts - Schema to Settings Generator

### Main Functions

#### generateAdminSettings()
```typescript
export async function generateAdminSettings(
  schemaPath: string = './prisma/schema.prisma',
  outputPath: string = './adminSettings.json'
): Promise<AdminSettings>
```
Generates initial settings from Prisma schema.

#### mergeAdminSettings()
```typescript
export async function mergeAdminSettings(
  schemaPath: string = './prisma/schema.prisma',
  settingsPath: string = './adminSettings.json'
): Promise<AdminSettings>
```
Merges new schema changes with existing settings, preserving customizations.

### Helper Functions

#### Field Generation
```typescript
function generateField(
  field: DMMF.Field, 
  modelName: string, 
  order: number
): AdminField
```
Creates AdminField from Prisma DMMF field with smart defaults:
- System fields (id, createdAt, updatedAt) are read-only
- Relations are not included in create/update by default
- Sorting disabled for lists and relations

#### Model Generation
```typescript
function generateModel(model: DMMF.Model): AdminModel
```
Creates AdminModel with:
- Automatic display name generation (PascalCase → Title Case)
- ID field detection (falls back to first unique field)
- Permission defaults based on ID field presence

### Generation Rules

1. **Field Permissions**:
   - `read`: Always true
   - `create`: False for system fields and relations
   - `update`: False for system fields, ID fields, and relations
   - `filter`: Always true
   - `sort`: False for lists and relations

2. **Model Permissions**:
   - `create`: Always true
   - `update/delete`: Only if model has ID or unique field

3. **Display Fields**:
   - Default to ID field only
   - Can be customized post-generation

## 4. custom-renderers.tsx - Custom Renderer System

### Types

```typescript
export interface FieldRendererProps {
  field: AdminField
  value: any
  onChange?: (value: any) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

export interface TableCellRendererProps {
  field: AdminField
  value: any
  record: any          // Full record for context
  className?: string
}

export type FieldRenderer = (props: FieldRendererProps) => ReactNode
export type TableCellRenderer = (props: TableCellRendererProps) => ReactNode
```

### Registration Functions

```typescript
// Register custom field renderer for forms
export function registerFieldRenderer(
  key: string, 
  renderer: FieldRenderer
): void

// Register custom table cell renderer
export function registerTableCellRenderer(
  key: string, 
  renderer: TableCellRenderer
): void
```

### Renderer Resolution

Renderers are resolved in this order:
1. Field-specific renderer (by field.id)
2. Type-based renderer (by field.type)
3. Custom renderer attribute (by field.customRenderer)
4. Default renderer

### Built-in Renderers

#### ColorPickerRenderer (Field)
```typescript
export const ColorPickerRenderer: FieldRenderer
```
Renders color input with preview.

#### ColorCellRenderer (Table)
```typescript
export const ColorCellRenderer: TableCellRenderer
```
Shows color swatch with hex value.

#### StatusBadgeRenderer (Table)
```typescript
export const StatusBadgeRenderer: TableCellRenderer
```
Colored badges for status fields.

#### ProgressBarRenderer (Table)
```typescript
export const ProgressBarRenderer: TableCellRenderer
```
Visual progress bar for numeric values.

#### RatingRenderer (Field)
```typescript
export const RatingRenderer: FieldRenderer
```
Interactive star rating input.

#### ImagePreviewRenderer (Table)
```typescript
export const ImagePreviewRenderer: TableCellRenderer
```
Thumbnail previews for image URLs/arrays.

### Usage Example

```typescript
// Register custom renderer in app initialization
registerTableCellRenderer('User.role', ({ value }) => {
  const colors = {
    ADMIN: 'text-red-600',
    USER: 'text-blue-600',
    GUEST: 'text-gray-600'
  }
  return <span className={colors[value]}>{value}</span>
})

// Or use customRenderer field in settings
{
  "name": "status",
  "customRenderer": "statusBadge"
}
```

## Integration Notes

1. **Settings Loading**: Settings are cached per request using React's `cache()` function
2. **File Location**: Settings file path is configurable but defaults to `adminSettings.json`
3. **Hot Reload**: Settings changes are picked up immediately in development
4. **Type Safety**: All functions are fully typed with TypeScript
5. **Error Handling**: Functions return null/empty arrays on errors rather than throwing

## 5. form-utils.ts - Form Field Utilities

### groupFormFields()
```typescript
export function groupFormFields(fields: AdminField[]): FormSection[]
```

Groups fields into logical sections for better form organization:

#### Section Categories
1. **Basic Information**: Common fields (name, title, email, etc.)
2. **Relationships**: All relation fields
3. **Additional Data**: JSON, arrays, and complex fields
4. **System Information**: Timestamps and system fields

#### Grouping Logic
```typescript
const sections = [
  {
    title: 'Basic Information',
    fields: fields.filter(f => 
      !f.relationField && 
      !systemFields.includes(f.name) &&
      f.kind === 'scalar'
    )
  },
  {
    title: 'Relationships',
    fields: fields.filter(f => f.relationField)
  },
  // ... more sections
]
```

### isFieldDisabled()
```typescript
export function isFieldDisabled(
  field: AdminField,
  isEdit: boolean
): boolean
```

Determines if a field should be disabled based on:
- Edit mode (create vs update)
- Field permissions
- System field status
- ID field restrictions

### getFieldValidation()
```typescript
export function getFieldValidation(field: AdminField): ValidationRules
```

Provides field-specific validation patterns:
- Email fields: Email regex pattern
- URL fields: URL validation pattern
- Number fields: Min/max constraints
- Required field validation

## 6. relation-validation.ts - Relation Configuration Validation

### Core Functions

#### isValidDisplayMode()
```typescript
export function isValidDisplayMode(
  mode: string,
  relationType: RelationType
): boolean
```

Validates if a display mode is appropriate for a relation type:
- One-to-One: link, dropdown, badge
- Many-to-One: dropdown, link, badge
- One-to-Many: count, tags, inline
- Many-to-Many: tags, count, inline

#### getValidDisplayModes()
```typescript
export function getValidDisplayModes(
  relationType: RelationType
): RelationDisplayMode[]
```

Returns all valid display modes for a given relation type.

#### validateRelationConfig()
```typescript
export function validateRelationConfig(
  field: AdminField
): AdminField
```

Fixes invalid relation configurations:
- Corrects mismatched display/edit modes
- Ensures valid mode for relation type
- Applies smart defaults

#### migrateRelationConfigs()
```typescript
export async function migrateRelationConfigs(): Promise<void>
```

Migrates all relation fields to valid configurations:
- Loads current settings
- Validates each relation field
- Saves corrected settings

### Validation Rules

1. **Display Mode Rules**:
   - Dropdown not allowed for many relations
   - Count only for list relations
   - Tags preferred for many-to-many

2. **Edit Mode Rules**:
   - Select/checkbox for small datasets
   - Autocomplete for large datasets
   - DualList for many-to-many with medium datasets

## 7. relation-helpers.ts - Relation Query Helpers

### getInverseRelationField()
```typescript
export async function getInverseRelationField(
  modelName: string,
  fieldName: string
): Promise<AdminField | null>
```

Finds the corresponding field in the related model:
- Uses relationName for matching
- Handles bidirectional relations
- Returns null for one-way relations

### getRelationViewAllFilter()
```typescript
export function getRelationViewAllFilter(
  parentModel: string,
  parentId: string | number,
  relationField: AdminField
): FilterValue[]
```

Builds filter configuration for "View All" navigation:

#### For Direct Relations
```typescript
// Post.authorId → filter by authorId
return [{
  field: relationFrom,
  operator: 'equals',
  value: parentId
}]
```

#### For Many-to-Many Relations
```typescript
// Post.categories → filter by categories containing parentId
return [{
  field: relationField.name,
  operator: 'some',
  value: { id: { equals: parentId } }
}]
```

### Usage in Navigation
Used when clicking "View All" in relation displays:
- Constructs appropriate filter
- Navigates to filtered list view
- Maintains context of parent record

## Relation Helpers Integration Notes

1. **Settings Loading**: Settings are cached per request using React's `cache()` function
2. **File Location**: Settings file path is configurable but defaults to `adminSettings.json`
3. **Hot Reload**: Settings changes are picked up immediately in development
4. **Type Safety**: All functions are fully typed with TypeScript
5. **Error Handling**: Functions return null/empty arrays on errors rather than throwing
6. **Validation**: Automatic validation ensures consistent configuration

## Best Practices

1. **Generate First**: Always generate initial settings from schema
2. **Customize Carefully**: Use Settings UI or edit JSON with care
3. **Preserve Customizations**: Use `mergeAdminSettings` when schema changes
4. **Register Renderers Early**: Add custom renderers in app initialization
5. **Use Display Fields**: Configure meaningful display fields for relations
6. **Validate Relations**: Run migration after schema changes to ensure valid configs
7. **Group Fields**: Use form-utils for consistent form organization