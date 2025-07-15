import { ReactNode } from 'react'
import { AdminField } from './types'

// Types for custom renderers
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
  record: any
  className?: string
}

export type FieldRenderer = (props: FieldRendererProps) => ReactNode
export type TableCellRenderer = (props: TableCellRendererProps) => ReactNode

// Registry for custom renderers
interface RendererRegistry {
  field: Map<string, FieldRenderer>
  tableCell: Map<string, TableCellRenderer>
}

const registry: RendererRegistry = {
  field: new Map(),
  tableCell: new Map()
}

// Register a custom field renderer
export function registerFieldRenderer(
  key: string, 
  renderer: FieldRenderer
): void {
  registry.field.set(key, renderer)
}

// Register a custom table cell renderer
export function registerTableCellRenderer(
  key: string, 
  renderer: TableCellRenderer
): void {
  registry.tableCell.set(key, renderer)
}

// Get a field renderer by key
export function getFieldRenderer(
  field: AdminField
): FieldRenderer | undefined {
  // Check for field-specific renderer first
  const fieldKey = `${field.id}`
  if (registry.field.has(fieldKey)) {
    return registry.field.get(fieldKey)
  }
  
  // Check for type-based renderer
  const typeKey = field.type.toLowerCase()
  if (registry.field.has(typeKey)) {
    return registry.field.get(typeKey)
  }
  
  // Check for custom renderer attribute
  if (field.customRenderer && registry.field.has(field.customRenderer)) {
    return registry.field.get(field.customRenderer)
  }
  
  return undefined
}

// Get a table cell renderer by key
export function getTableCellRenderer(
  field: AdminField
): TableCellRenderer | undefined {
  // Check for field-specific renderer first
  const fieldKey = `${field.id}`
  if (registry.tableCell.has(fieldKey)) {
    return registry.tableCell.get(fieldKey)
  }
  
  // Check for type-based renderer
  const typeKey = field.type.toLowerCase()
  if (registry.tableCell.has(typeKey)) {
    return registry.tableCell.get(typeKey)
  }
  
  // Check for custom renderer attribute
  if (field.customRenderer && registry.tableCell.has(field.customRenderer)) {
    return registry.tableCell.get(field.customRenderer)
  }
  
  return undefined
}

// Clear all renderers (useful for testing)
export function clearRenderers(): void {
  registry.field.clear()
  registry.tableCell.clear()
}

// Example: Color picker renderer
export const ColorPickerRenderer: FieldRenderer = ({ value, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="h-10 w-20 rounded border cursor-pointer"
      />
      <span className="text-sm text-muted-foreground">{value || 'No color'}</span>
    </div>
  )
}

// Example: Color display renderer for tables
export const ColorCellRenderer: TableCellRenderer = ({ value }) => {
  if (!value) return <span className="text-muted-foreground">-</span>
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="h-6 w-6 rounded border" 
        style={{ backgroundColor: value }}
      />
      <span className="text-sm">{value}</span>
    </div>
  )
}

// Example: Status badge renderer
export const StatusBadgeRenderer: TableCellRenderer = ({ value }) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  }
  
  const colorClass = statusColors[value?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {value || 'Unknown'}
    </span>
  )
}

// Example: Progress bar renderer
export const ProgressBarRenderer: TableCellRenderer = ({ value }) => {
  const percentage = Math.min(100, Math.max(0, value || 0))
  
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
    </div>
  )
}

// Example: Rating stars renderer
export const RatingRenderer: FieldRenderer = ({ value, onChange, disabled }) => {
  const rating = value || 0
  const stars = [1, 2, 3, 4, 5]
  
  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={disabled}
          className={`text-2xl ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-yellow-400'}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
    </div>
  )
}

// Example: Image preview renderer
export const ImagePreviewRenderer: TableCellRenderer = ({ value }) => {
  if (!value) return <span className="text-muted-foreground">No image</span>
  
  const images = Array.isArray(value) ? value : [value]
  
  return (
    <div className="flex gap-1">
      {images.slice(0, 3).map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Image ${index + 1}`}
          className="h-10 w-10 object-cover rounded border"
        />
      ))}
      {images.length > 3 && (
        <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
          +{images.length - 3}
        </div>
      )}
    </div>
  )
}