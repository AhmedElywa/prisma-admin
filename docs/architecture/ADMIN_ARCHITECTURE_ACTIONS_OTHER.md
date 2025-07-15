# Admin Architecture - Other Server Actions

This document details the non-CRUD server actions in `src/lib/actions/`.

## Files Covered
- `settings.ts` - Settings management actions
- `import.ts` - CSV import/export functionality  
- `filter-actions.ts` - Filter field helpers
- `form-data.ts` - Form field data helpers

## 1. settings.ts - Settings Management Actions

### saveModelSettings()

```typescript
export async function saveModelSettings(
  models: AdminModel[]
): Promise<{ success: boolean }>
```

**Purpose**: Updates model configurations in adminSettings.json.

**Features**:
- Direct file system access (bypasses cache)
- Partial updates (only changed models)
- Preserves other settings (enums)
- Triggers full admin revalidation

**Process**:
1. Reads current settings from file
2. Creates map of updated models
3. Merges with existing models
4. Writes back to file
5. Revalidates all admin routes

### regenerateSettings()

```typescript
export async function regenerateSettings(): Promise<void>
```

**Purpose**: Regenerates settings from Prisma schema while preserving customizations.

**Features**:
- Uses mergeAdminSettings from generator
- Preserves custom field labels, permissions
- Adds new fields/models automatically
- Removes deleted fields/models

### resetFieldSettings()

```typescript
export async function resetFieldSettings(
  modelId: string
): Promise<{ success: boolean }>
```

**Purpose**: Resets a model's field permissions to defaults.

**Default Rules**:
- `read`: true for all fields
- `create/update`: false for system fields (id, createdAt, updatedAt)
- `filter`: true for all fields
- `sort`: false for lists and relations
- `editor/upload`: false for all fields

## 2. import.ts - CSV Import/Export

### importCSVData()

```typescript
export async function importCSVData(formData: FormData)
```

**Purpose**: Bulk imports records from CSV file.

**Parameters** (from FormData):
- `file`: CSV file
- `modelName`: Target model
- `mappings`: Column to field mappings
- `skipFirstRow`: Skip header row

**Features**:
- Permission checking
- CSV parsing with quote handling
- Type conversion per field type
- Batch processing with error collection
- Stops after 100 errors

**CSV Parsing**:
- Handles quoted values
- Escapes quotes with ""
- Supports commas in quoted values

**Type Conversion**:
- **Numbers**: parseInt/parseFloat with NaN checking
- **Booleans**: Multiple formats (true/1/yes → true)
- **Dates**: Date parsing with validation
- **JSON**: JSON.parse with error handling

### exportToCSV()

```typescript
export async function exportToCSV(
  modelName: string,
  ids?: (string | number)[]
): Promise<string>
```

**Purpose**: Exports records to CSV format.

**Features**:
- Exports all or filtered by IDs
- Only includes readable scalar fields
- Proper CSV escaping
- DateTime ISO formatting
- Boolean as true/false strings

### Helper Functions

#### parseCSVLine()
```typescript
function parseCSVLine(line: string): string[]
```
Handles CSV parsing with quote awareness.

#### escapeCSVValue()
```typescript
function escapeCSVValue(value: string): string
```
Escapes values containing commas, quotes, or newlines.

#### convertValue()
```typescript
function convertValue(value: string, field: AdminField): any
```
Converts string values to appropriate types with validation.

## 3. filter-actions.ts - Filter Helpers

### getRelationFilterFields()

```typescript
export async function getRelationFilterFields(
  modelName: string
): Promise<FilterConfig[]>
```

**Purpose**: Gets filterable fields formatted for filter UI.

**Returns**: Array of FilterConfig objects with:
- Field metadata (name, label, type)
- Relation information
- Enum values if applicable

**Used By**: Filter panel for dynamic field loading

## 4. form-data.ts - Form Data Helpers

### getFormFieldsData()

```typescript
export async function getFormFieldsData(
  modelName: string
): Promise<FormFieldData[]>
```

**Purpose**: Prepares field data for form generation.

**Returns**: Enhanced field data with:
- Input type determination
- Enum options
- Related model information
- All field metadata

**Features**:
- Determines appropriate input types
- Loads enum values
- Identifies foreign key relations
- Prepares data for FormGenerator

### getModelSettingsData()

```typescript
export async function getModelSettingsData(
  modelName: string
): Promise<AdminModel | null>
```

**Purpose**: Server action wrapper for getModelSettings.

### getRecordDisplayValue()

```typescript
export async function getRecordDisplayValue(
  modelName: string,
  record: any
): Promise<string>
```

**Purpose**: Server action wrapper for display value generation.

## Integration Notes

### File System Access
- Settings actions use `fs/promises` directly
- Bypass React cache for immediate updates
- Use `path.join(process.cwd(), ...)` for paths

### Revalidation Strategy
- Settings changes: Full layout revalidation
- Import operations: Model-specific revalidation
- Always use `revalidatePath()` after mutations

### Error Handling
- Import: Collects errors, continues processing
- Settings: Throws on write failures
- All actions: Console.error for debugging

### Permission Checks
- Import checks `canCreateModel`
- Settings operations unrestricted (admin only)
- Export checks model existence

## Usage Examples

### Settings Update
```typescript
// In Settings UI
async function handleSave(models: AdminModel[]) {
  const result = await saveModelSettings(models)
  if (result.success) {
    toast.success('Settings saved')
  }
}
```

### CSV Import
```typescript
// In Import Dialog
async function handleImport(e: FormEvent) {
  const formData = new FormData(e.target)
  formData.append('modelName', 'User')
  formData.append('mappings', JSON.stringify({
    'Email': 'email',
    'Name': 'name'
  }))
  
  const result = await importCSVData(formData)
  console.log(`Imported: ${result.success}, Failed: ${result.failed}`)
}
```

### Filter Configuration
```typescript
// In Filter Panel
const filterFields = await getRelationFilterFields('Post')
// Returns fields with relation metadata
```