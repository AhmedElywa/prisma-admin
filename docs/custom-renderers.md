# Custom Renderers

The admin panel supports custom renderers for both form fields and table cells, allowing you to create specialized UI components for specific field types or model fields.

## Overview

Custom renderers let you:
- Create custom form inputs (color pickers, rating stars, etc.)
- Display data in tables with custom formatting (status badges, progress bars, etc.)
- Override default field rendering for specific models or field types
- Build reusable UI components for common patterns

## Basic Usage

### 1. Register Custom Renderers

Create a configuration file to register your custom renderers:

```typescript
// app/admin/custom-renderers.config.ts
import { 
  registerFieldRenderer, 
  registerTableCellRenderer 
} from '@/lib/admin/custom-renderers'

export function initializeCustomRenderers() {
  // Register by field name
  registerFieldRenderer('color', ColorPickerRenderer)
  
  // Register by model.field
  registerFieldRenderer('Product.rating', RatingRenderer)
  
  // Register for table cells
  registerTableCellRenderer('status', StatusBadgeRenderer)
}
```

### 2. Initialize Renderers

Call the initialization function early in your app:

```typescript
// In a client component or app initialization
import { initializeCustomRenderers } from './custom-renderers.config'

// Initialize once when the app loads
initializeCustomRenderers()
```

### 3. Add customRenderer to Settings

You can also specify custom renderers in the admin settings:

```json
{
  "fields": [
    {
      "name": "color",
      "customRenderer": "colorPicker"
    }
  ]
}
```

## Creating Custom Renderers

### Field Renderer (Form Inputs)

```typescript
import { FieldRenderer } from '@/lib/admin/custom-renderers'

const ColorPickerRenderer: FieldRenderer = ({ 
  field, 
  value, 
  onChange, 
  disabled, 
  required 
}) => {
  return (
    <div className="space-y-2">
      <label>{field.title}</label>
      <input
        type="color"
        name={field.name}
        value={value || '#000000'}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
      />
    </div>
  )
}
```

### Table Cell Renderer

```typescript
import { TableCellRenderer } from '@/lib/admin/custom-renderers'

const StatusBadgeRenderer: TableCellRenderer = ({ value }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  }
  
  return (
    <span className={`badge ${colors[value] || colors.inactive}`}>
      {value}
    </span>
  )
}
```

## Built-in Renderers

The following renderers are included:

### ColorPickerRenderer / ColorCellRenderer
- For color fields
- Shows color picker input and color preview

### StatusBadgeRenderer
- For status fields
- Shows colored badges

### ProgressBarRenderer
- For percentage/progress fields
- Shows visual progress bar

### RatingRenderer
- For rating fields
- Shows interactive star rating

### ImagePreviewRenderer
- For image URLs or arrays
- Shows image thumbnails

## Registration Priority

Renderers are checked in this order:
1. Model.field specific renderer (e.g., "Product.color")
2. Field type renderer (e.g., "color")
3. customRenderer attribute in settings
4. Default field type renderer

## Advanced Examples

### Conditional Renderer

```typescript
registerTableCellRenderer('Product.stock', ({ value, record }) => {
  const isLow = value < 10
  return (
    <span className={isLow ? 'text-red-600 font-bold' : ''}>
      {value} {isLow && '⚠️'}
    </span>
  )
})
```

### Async Data Renderer

```typescript
const UserAvatarRenderer: TableCellRenderer = ({ value, record }) => {
  const [avatar, setAvatar] = useState(null)
  
  useEffect(() => {
    fetch(`/api/users/${record.id}/avatar`)
      .then(res => res.json())
      .then(data => setAvatar(data.url))
  }, [record.id])
  
  return avatar ? <img src={avatar} className="w-8 h-8 rounded-full" /> : '...'
}
```

### Complex Form Input

```typescript
const AddressRenderer: FieldRenderer = ({ field, value, onChange }) => {
  const [address, setAddress] = useState(value || {})
  
  const updateField = (key: string, val: string) => {
    const updated = { ...address, [key]: val }
    setAddress(updated)
    onChange?.(updated)
  }
  
  return (
    <div className="space-y-2">
      <Input
        placeholder="Street"
        value={address.street || ''}
        onChange={(e) => updateField('street', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="City"
          value={address.city || ''}
          onChange={(e) => updateField('city', e.target.value)}
        />
        <Input
          placeholder="Zip"
          value={address.zip || ''}
          onChange={(e) => updateField('zip', e.target.value)}
        />
      </div>
    </div>
  )
}
```

## Best Practices

1. **Keep renderers focused**: Each renderer should handle one specific type of field
2. **Handle edge cases**: Always handle null/undefined values
3. **Maintain consistency**: Use the same styling patterns as the rest of the admin
4. **Performance**: Avoid heavy computations in table cell renderers
5. **Accessibility**: Ensure custom inputs are keyboard accessible
6. **Form integration**: For form fields, always render proper input elements with name attributes