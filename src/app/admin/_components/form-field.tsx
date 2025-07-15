'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { JsonEditor } from './json-editor'
import { getFieldRenderer } from '@/lib/admin/custom-renderers'
import { AdminField } from '@/lib/admin/types'
import dynamic from 'next/dynamic'

// Dynamically import RelationEditField to avoid SSR issues
const RelationEditField = dynamic(
  () => import('./relations/RelationEditField').then(mod => mod.RelationEditField),
  { 
    ssr: false,
    loading: () => <div className="h-10 bg-muted animate-pulse rounded" />
  }
)

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then(mod => mod.RichTextEditor),
  { 
    ssr: false,
    loading: () => <div className="h-40 bg-muted animate-pulse rounded" />
  }
)

// Dynamically import FileUpload to avoid SSR issues
const FileUpload = dynamic(
  () => import('./file-upload').then(mod => mod.FileUpload),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-muted animate-pulse rounded" />
  }
)

// Dynamically import ArrayField to avoid SSR issues
const ArrayField = dynamic(
  () => import('./array-field').then(mod => mod.ArrayField),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-muted animate-pulse rounded" />
  }
)

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
  accept?: string // For file upload
  multiple?: boolean // For file upload
  fieldType?: string // For array fields (String, Int, etc.)
  field?: AdminField // Full field metadata for custom renderers
  inModal?: boolean // If rendered inside a modal
}

export function FormField({
  name,
  label,
  type,
  defaultValue,
  required = false,
  options = [],
  placeholder,
  disabled = false,
  relatedModel,
  accept,
  multiple = false,
  fieldType,
  field,
  inModal = false,
}: FormFieldProps) {
  // Check for custom renderer first
  if (field) {
    const customRenderer = getFieldRenderer(field)
    if (customRenderer) {
      return customRenderer({
        field,
        value: defaultValue,
        disabled,
        required,
        onChange: (value) => {
          // For client-side components, we'd need to handle this differently
          // For now, custom renderers should handle their own form inputs
        }
      })
    }
  }
  
  switch (type) {
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={name}
            name={name}
            defaultChecked={defaultValue === true}
            disabled={disabled}
            value="true"
          />
          <Label htmlFor={name} className="cursor-pointer">
            {label}
          </Label>
        </div>
      )

    case 'json':
      return (
        <JsonEditor
          name={name}
          label={label}
          defaultValue={defaultValue}
          required={required}
          height={inModal ? '500px' : '400px'}
        />
      )

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select name={name} defaultValue={defaultValue?.toString()} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {!required && (
                <SelectItem value="">None</SelectItem>
              )}
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'datetime':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={name}
            name={name}
            type="datetime-local"
            defaultValue={defaultValue ? new Date(defaultValue).toISOString().slice(0, 16) : ''}
            required={required}
            disabled={disabled}
          />
        </div>
      )

    case 'richtext':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <RichTextEditor
            name={name}
            value={defaultValue}
            placeholder={placeholder}
            minHeight={inModal ? '300px' : '200px'}
          />
        </div>
      )

    case 'file':
    case 'upload':
      return (
        <FileUpload
          name={name}
          label={label}
          value={defaultValue}
          required={required}
          accept={accept}
          multiple={multiple}
        />
      )

    case 'textarea':
    case 'editor':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={name}
            name={name}
            defaultValue={defaultValue}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            rows={inModal ? (type === 'editor' ? 15 : 8) : (type === 'editor' ? 10 : 4)}
          />
        </div>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={name}
            name={name}
            type="number"
            defaultValue={defaultValue}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            step="any"
          />
        </div>
      )

    case 'email':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={name}
            name={name}
            type="email"
            defaultValue={defaultValue}
            required={required}
            placeholder={placeholder || 'email@example.com'}
            disabled={disabled}
          />
        </div>
      )

    case 'password':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={name}
            name={name}
            type="password"
            defaultValue={defaultValue}
            required={required}
            placeholder={placeholder || '••••••••'}
            disabled={disabled}
          />
        </div>
      )

    case 'url':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={name}
            name={name}
            type="url"
            defaultValue={defaultValue}
            required={required}
            placeholder={placeholder || 'https://example.com'}
            disabled={disabled}
          />
        </div>
      )

    case 'relation':
      if (!relatedModel || !field) {
        // Fallback to text input if no related model or field metadata specified
        return (
          <div className="space-y-2">
            <Label htmlFor={name}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={name}
              name={name}
              type="text"
              defaultValue={defaultValue}
              required={required}
              placeholder={placeholder || `Enter ${label} ID`}
              disabled={disabled}
            />
          </div>
        )
      }
      
      // Use the new configurable relation edit field
      return (
        <RelationEditField
          field={field}
          name={name}
          label={label}
          value={defaultValue}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          relatedModel={relatedModel}
        />
      )

    case 'array':
      return (
        <ArrayField
          name={name}
          label={label}
          type={fieldType as 'String' | 'Int' | 'Float' | 'Boolean' | 'DateTime' | 'Json'}
          value={defaultValue}
          required={required}
          placeholder={placeholder}
        />
      )

    case 'text':
    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={name}
            name={name}
            type="text"
            defaultValue={defaultValue}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      )
  }
}