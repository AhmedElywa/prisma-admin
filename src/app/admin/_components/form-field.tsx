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

// Common field wrapper component
const FieldWrapper = ({
  children,
  name,
  label,
  required,
}: {
  children: React.ReactNode;
  name: string;
  label: string;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </Label>
    {children}
  </div>
);

// Input field component
const InputField = ({
  type,
  name,
  label,
  defaultValue,
  disabled,
  placeholder,
  required,
  step,
}: {
  type: string;
  name: string;
  label: string;
  defaultValue?: any;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  step?: string;
}) => (
  <FieldWrapper label={label} name={name} required={required}>
    <Input
      defaultValue={defaultValue}
      disabled={disabled}
      id={name}
      name={name}
      placeholder={placeholder}
      required={required}
      step={step}
      type={type}
    />
  </FieldWrapper>
);

// Helper components for specific field types
const BooleanField = ({ name, label, defaultValue, disabled }: any) => (
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

const SelectField = ({
  name,
  label,
  defaultValue,
  disabled,
  required,
  placeholder,
  options,
}: any) => (
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
        {options.map((option: string) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const DateTimeField = ({
  name,
  label,
  defaultValue,
  disabled,
  required,
}: any) => (
  <FieldWrapper label={label} name={name} required={required}>
    <Input
      defaultValue={
        defaultValue ? new Date(defaultValue).toISOString().slice(0, 16) : ''
      }
      disabled={disabled}
      id={name}
      name={name}
      required={required}
      type="datetime-local"
    />
  </FieldWrapper>
);

const TextAreaField = ({
  name,
  label,
  defaultValue,
  disabled,
  required,
  placeholder,
  rows,
}: any) => (
  <FieldWrapper label={label} name={name} required={required}>
    <Textarea
      defaultValue={defaultValue}
      disabled={disabled}
      id={name}
      name={name}
      placeholder={placeholder}
      required={required}
      rows={rows}
    />
  </FieldWrapper>
);

// Field type configuration
type FieldConfig = {
  component: React.ComponentType<any>;
  props?: (props: FormFieldProps) => Record<string, any>;
};

// Special component for richtext that needs wrapper
const RichTextFieldWrapper = (props: any) => (
  <FieldWrapper label={props.label} name={props.name} required={props.required}>
    <RichTextEditor
      minHeight={props.minHeight}
      name={props.name}
      placeholder={props.placeholder}
      value={props.value}
    />
  </FieldWrapper>
);

// Map of field types to their components and prop transformers
const fieldTypeMap: Record<string, FieldConfig> = {
  boolean: {
    component: BooleanField,
    props: ({ defaultValue, disabled, label, name }) => ({
      defaultValue,
      disabled,
      label,
      name,
    }),
  },
  json: {
    component: JsonEditor,
    props: ({ defaultValue, inModal, label, name, required }) => ({
      defaultValue,
      height: inModal ? '500px' : '400px',
      label,
      name,
      required,
    }),
  },
  select: {
    component: SelectField,
    props: ({
      defaultValue,
      disabled,
      label,
      name,
      options,
      placeholder,
      required,
    }) => ({
      defaultValue,
      disabled,
      label,
      name,
      options,
      placeholder,
      required,
    }),
  },
  datetime: {
    component: DateTimeField,
    props: ({ defaultValue, disabled, label, name, required }) => ({
      defaultValue,
      disabled,
      label,
      name,
      required,
    }),
  },
  richtext: {
    component: RichTextFieldWrapper,
    props: ({ defaultValue, inModal, label, name, placeholder, required }) => ({
      minHeight: inModal ? '300px' : '200px',
      name,
      placeholder,
      value: defaultValue,
      label,
      required,
    }),
  },
  file: {
    component: FileUpload,
    props: ({ accept, label, multiple, name, required, defaultValue }) => ({
      accept,
      label,
      multiple,
      name,
      required,
      value: defaultValue,
    }),
  },
  upload: {
    component: FileUpload,
    props: ({ accept, label, multiple, name, required, defaultValue }) => ({
      accept,
      label,
      multiple,
      name,
      required,
      value: defaultValue,
    }),
  },
  textarea: {
    component: TextAreaField,
    props: ({
      defaultValue,
      disabled,
      label,
      name,
      placeholder,
      required,
      inModal,
    }) => ({
      defaultValue,
      disabled,
      label,
      name,
      placeholder,
      required,
      rows: inModal ? 8 : 4,
    }),
  },
  editor: {
    component: TextAreaField,
    props: ({
      defaultValue,
      disabled,
      label,
      name,
      placeholder,
      required,
      inModal,
    }) => ({
      defaultValue,
      disabled,
      label,
      name,
      placeholder,
      required,
      rows: inModal ? 15 : 10,
    }),
  },
  array: {
    component: ArrayField,
    props: ({
      label,
      name,
      placeholder,
      required,
      fieldType,
      defaultValue,
    }) => ({
      label,
      name,
      placeholder,
      required,
      type: fieldType as
        | 'String'
        | 'Int'
        | 'Float'
        | 'Boolean'
        | 'DateTime'
        | 'Json',
      value: defaultValue,
    }),
  },
};

// Get field configuration
function getFieldConfig(type: string, props: FormFieldProps): React.ReactNode {
  const config = fieldTypeMap[type];
  if (config) {
    const Component = config.component;
    const componentProps = config.props ? config.props(props) : props;
    return <Component {...componentProps} />;
  }
  return null;
}

// Main FormField component
export function FormField(props: FormFieldProps) {
  const {
    name,
    label,
    type,
    defaultValue,
    required = false,
    placeholder,
    disabled = false,
    relatedModel,
    field,
  } = props;

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

  // Try to get field from map
  const fieldComponent = getFieldConfig(type, props);
  if (fieldComponent) {
    return fieldComponent;
  }

  // Handle relation type
  if (type === 'relation') {
    if (!(relatedModel && field)) {
      return (
        <InputField
          defaultValue={defaultValue}
          disabled={disabled}
          label={label}
          name={name}
          placeholder={placeholder || `Enter ${label} ID`}
          required={required}
          type="text"
        />
      );
    }
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
  }

  // Default to input field with type mapping
  return renderStandardInput(props);
}

// Helper function to render standard input fields
function renderStandardInput(props: FormFieldProps) {
  const { type, placeholder, defaultValue, disabled, label, name, required } =
    props;

  const inputTypeMap: Record<string, string> = {
    number: 'number',
    email: 'email',
    password: 'password',
    url: 'url',
  };

  const placeholderMap: Record<string, string> = {
    email: 'email@example.com',
    password: '••••••••',
    url: 'https://example.com',
  };

  const inputType = inputTypeMap[type] || 'text';
  const inputPlaceholder = placeholder || placeholderMap[type] || placeholder;

  return (
    <InputField
      defaultValue={defaultValue}
      disabled={disabled}
      label={label}
      name={name}
      placeholder={inputPlaceholder}
      required={required}
      step={type === 'number' ? 'any' : undefined}
      type={inputType}
    />
  );
}
