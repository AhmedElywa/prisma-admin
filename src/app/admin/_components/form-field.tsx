'use client';

import dynamic from 'next/dynamic';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getFieldRenderer } from '@/lib/admin/custom-renderers';
import type { AdminField } from '@/lib/admin/types';
import { JsonEditor } from './json-editor';

// Dynamically import RelationEditField to avoid SSR issues
const RelationEditField = dynamic(
  () =>
    import('./relations/RelationEditField').then(
      (mod) => mod.RelationEditField
    ),
  {
    ssr: false,
    loading: () => <div className="h-10 animate-pulse rounded bg-muted" />,
  }
);

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-40 animate-pulse rounded bg-muted" />,
  }
);

// Dynamically import FileUpload to avoid SSR issues
const FileUpload = dynamic(
  () => import('./file-upload').then((mod) => mod.FileUpload),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse rounded bg-muted" />,
  }
);

// Dynamically import ArrayField to avoid SSR issues
const ArrayField = dynamic(
  () => import('./array-field').then((mod) => mod.ArrayField),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse rounded bg-muted" />,
  }
);

interface FormFieldProps {
  name: string;
  label: string;
  type: string;
  defaultValue?: any;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  disabled?: boolean;
  relatedModel?: string;
  accept?: string; // For file upload
  multiple?: boolean; // For file upload
  fieldType?: string; // For array fields (String, Int, etc.)
  field?: AdminField; // Full field metadata for custom renderers
  inModal?: boolean; // If rendered inside a modal
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
    const customRenderer = getFieldRenderer(field);
    if (customRenderer) {
      return customRenderer({
        field,
        value: defaultValue,
        disabled,
        required,
        onChange: (_value) => {
          // For client-side components, we'd need to handle this differently
          // For now, custom renderers should handle their own form inputs
        },
      });
    }
  }

  switch (type) {
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            defaultChecked={defaultValue === true}
            disabled={disabled}
            id={name}
            name={name}
            value="true"
          />
          <Label className="cursor-pointer" htmlFor={name}>
            {label}
          </Label>
        </div>
      );

    case 'json':
      return (
        <JsonEditor
          defaultValue={defaultValue}
          height={inModal ? '500px' : '400px'}
          label={label}
          name={name}
          required={required}
        />
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Select
            defaultValue={defaultValue?.toString()}
            disabled={disabled}
            name={name}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {!required && <SelectItem value="">None</SelectItem>}
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'datetime':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            defaultValue={
              defaultValue
                ? new Date(defaultValue).toISOString().slice(0, 16)
                : ''
            }
            disabled={disabled}
            id={name}
            name={name}
            required={required}
            type="datetime-local"
          />
        </div>
      );

    case 'richtext':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <RichTextEditor
            minHeight={inModal ? '300px' : '200px'}
            name={name}
            placeholder={placeholder}
            value={defaultValue}
          />
        </div>
      );

    case 'file':
    case 'upload':
      return (
        <FileUpload
          accept={accept}
          label={label}
          multiple={multiple}
          name={name}
          required={required}
          value={defaultValue}
        />
      );

    case 'textarea':
    case 'editor':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Textarea
            defaultValue={defaultValue}
            disabled={disabled}
            id={name}
            name={name}
            placeholder={placeholder}
            required={required}
            rows={
              inModal
                ? type === 'editor'
                  ? 15
                  : 8
                : type === 'editor'
                  ? 10
                  : 4
            }
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            defaultValue={defaultValue}
            disabled={disabled}
            id={name}
            name={name}
            placeholder={placeholder}
            required={required}
            step="any"
            type="number"
          />
        </div>
      );

    case 'email':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            defaultValue={defaultValue}
            disabled={disabled}
            id={name}
            name={name}
            placeholder={placeholder || 'email@example.com'}
            required={required}
            type="email"
          />
        </div>
      );

    case 'password':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            defaultValue={defaultValue}
            disabled={disabled}
            id={name}
            name={name}
            placeholder={placeholder || '••••••••'}
            required={required}
            type="password"
          />
        </div>
      );

    case 'url':
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            defaultValue={defaultValue}
            disabled={disabled}
            id={name}
            name={name}
            placeholder={placeholder || 'https://example.com'}
            required={required}
            type="url"
          />
        </div>
      );

    case 'relation':
      if (!(relatedModel && field)) {
        // Fallback to text input if no related model or field metadata specified
        return (
          <div className="space-y-2">
            <Label htmlFor={name}>
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </Label>
            <Input
              defaultValue={defaultValue}
              disabled={disabled}
              id={name}
              name={name}
              placeholder={placeholder || `Enter ${label} ID`}
              required={required}
              type="text"
            />
          </div>
        );
      }

      // Use the new configurable relation edit field
      return (
        <RelationEditField
          disabled={disabled}
          field={field}
          label={label}
          name={name}
          placeholder={placeholder}
          relatedModel={relatedModel}
          required={required}
          value={defaultValue}
        />
      );

    case 'array':
      return (
        <ArrayField
          label={label}
          name={name}
          placeholder={placeholder}
          required={required}
          type={
            fieldType as
              | 'String'
              | 'Int'
              | 'Float'
              | 'Boolean'
              | 'DateTime'
              | 'Json'
          }
          value={defaultValue}
        />
      );
    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            defaultValue={defaultValue}
            disabled={disabled}
            id={name}
            name={name}
            placeholder={placeholder}
            required={required}
            type="text"
          />
        </div>
      );
  }
}
