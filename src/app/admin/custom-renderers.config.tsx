// Example configuration for custom renderers
// This file demonstrates how to register custom renderers for specific fields or types

import {
  ColorCellRenderer,
  ColorPickerRenderer,
  ImagePreviewRenderer,
  ProgressBarRenderer,
  RatingRenderer,
  registerFieldRenderer,
  registerTableCellRenderer,
  StatusBadgeRenderer,
} from '@/lib/admin/custom-renderers';

// Initialize custom renderers
export function initializeCustomRenderers() {
  // Example: Register color picker for any field with 'color' in the name
  registerFieldRenderer('color', ColorPickerRenderer);
  registerTableCellRenderer('color', ColorCellRenderer);

  // Example: Register status badge for specific fields
  registerTableCellRenderer('status', StatusBadgeRenderer);
  registerTableCellRenderer('Product.available', (props) => {
    const status = props.value ? 'active' : 'inactive';
    return StatusBadgeRenderer({ ...props, value: status });
  });

  // Example: Register rating renderer for rating fields
  registerFieldRenderer('rating', RatingRenderer);
  registerFieldRenderer('Product.ratings', RatingRenderer);

  // Example: Register progress bar for percentage fields
  registerTableCellRenderer('progress', ProgressBarRenderer);
  registerTableCellRenderer('completion', ProgressBarRenderer);

  // Example: Register image preview for image fields
  registerTableCellRenderer('image', ImagePreviewRenderer);
  registerTableCellRenderer('images', ImagePreviewRenderer);
  registerTableCellRenderer('avatar', ImagePreviewRenderer);
  registerTableCellRenderer('Product.images', ImagePreviewRenderer);

  // Example: Custom renderer for a specific model field
  registerFieldRenderer('User.email', (props) => {
    return (
      <div className="space-y-2">
        <label className="font-medium text-sm">
          {props.field.title}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-md border px-3 py-2"
            defaultValue={props.value}
            disabled={props.disabled}
            name={props.field.name}
            placeholder="user@example.com"
            required={props.required}
            type="email"
          />
          <button
            className="rounded-md bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
            onClick={() => {
              const domain = props.value?.split('@')[1];
              if (domain) {
                window.open(`https://${domain}`, '_blank');
              }
            }}
            type="button"
          >
            Visit Domain
          </button>
        </div>
      </div>
    );
  });

  // Example: Custom JSON viewer for metadata fields
  registerTableCellRenderer('metadata', (props) => {
    if (!props.value) {
      return <span className="text-muted-foreground">-</span>;
    }

    try {
      const json =
        typeof props.value === 'string' ? JSON.parse(props.value) : props.value;
      const keys = Object.keys(json).length;
      return (
        <span className="text-muted-foreground text-sm">
          {keys} {keys === 1 ? 'property' : 'properties'}
        </span>
      );
    } catch {
      return (
        <span className="text-muted-foreground text-sm">Invalid JSON</span>
      );
    }
  });
}

// Call this function in your app initialization
// For example, in app/layout.tsx or a client component that loads early
// initializeCustomRenderers()
