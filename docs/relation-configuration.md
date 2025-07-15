# Relation Configuration Guide

This guide explains how to configure relations in the Prisma Admin tool using the settings UI.

## Overview

The Prisma Admin tool provides a comprehensive UI for configuring how database relations are displayed and edited. Each relation field can be customized independently to provide the best user experience for your specific use case.

## Accessing Relation Settings

1. Navigate to **Admin Settings** (`/admin/settings`)
2. Select the model containing the relation field you want to configure
3. In the field list, find the relation field (marked with a link icon)
4. Click the expand button (chevron) to reveal relation settings

## Configuration Options

### Display Settings

Configure how relations appear in data tables and detail views:

#### Display Mode
- **Dropdown**: Shows a dropdown menu with actions (filter, view, edit, viewAll)
- **Tags**: Displays as pill badges, ideal for many-to-many relations
- **Count**: Shows the count with preview on hover
- **Inline**: Displays full record details inline
- **Badge**: Compact badge display for space-constrained layouts
- **Link**: Simple clickable link

#### Available Actions
Control which actions users can perform:
- **Filter**: Allow filtering by this relation
- **View**: Enable viewing the related record
- **Edit**: Allow editing the relation
- **View All**: Show option to view all related records

### Edit Settings

Configure how relations are edited in forms:

#### Edit Mode
- **Select**: Standard dropdown select (best for <50 items)
- **Autocomplete**: Search-as-you-type (best for large datasets)
- **Tags**: Multi-select with tag input
- **Dual List**: Side-by-side lists for selection
- **Modal**: Opens a modal with full table view
- **Inline**: Embedded form for creating/editing
- **Checkbox**: Checkbox list (best for <20 items)

#### Edit Options
- **Searchable**: Enable search functionality
- **Allow Create New**: Let users create new related records
- **Max Display Items**: Limit visible items in lists/tags

### Advanced Settings

#### Preview Fields
Specify which fields to display when showing related records:
- Add field names that should be shown
- Fields are displayed in the order specified
- Common fields: `name`, `title`, `email`, `id`

#### Load Strategy
Optimize performance based on your needs:
- **Eager**: Load relations with the parent query
- **Lazy**: Load when first accessed
- **On Demand**: Load only when user requests

### Presets

Quick configurations for common scenarios:

- **Compact**: Minimal space usage, ideal for dense tables
- **Rich**: Maximum information display
- **Performance**: Optimized for large datasets

## Relation Type Defaults

The system applies smart defaults based on relation type:

### One-to-One Relations
- Display: Link
- Edit: Inline
- Load: Eager

### Many-to-One Relations
- Display: Dropdown
- Edit: Select (or Autocomplete for large datasets)
- Load: Lazy

### One-to-Many Relations
- Display: Count
- Edit: Modal
- Load: On Demand

### Many-to-Many Relations
- Display: Tags
- Edit: Tags (or Dual List for large datasets)
- Load: Lazy

## Best Practices

1. **Consider Dataset Size**: Use autocomplete or modal for relations with many records
2. **Optimize Loading**: Use eager loading sparingly to avoid performance issues
3. **Preview Fields**: Choose fields that help users identify records quickly
4. **Action Permissions**: Only enable actions users actually need
5. **Test Different Modes**: Try different display/edit modes to find what works best

## Examples

### User Profile (One-to-One)
```json
{
  "relationDisplayMode": "inline",
  "relationEditMode": "inline",
  "relationLoadStrategy": "eager"
}
```

### Post Author (Many-to-One)
```json
{
  "relationDisplayMode": "dropdown",
  "relationEditMode": "select",
  "relationEditOptions": {
    "searchable": true,
    "previewFields": ["name", "email"]
  }
}
```

### Post Tags (Many-to-Many)
```json
{
  "relationDisplayMode": "tags",
  "relationEditMode": "tags",
  "relationEditOptions": {
    "searchable": true,
    "createable": true,
    "maxDisplay": 5
  }
}
```

## Saving Changes

After configuring relations:
1. Click **Save Changes** to persist your settings
2. Changes are saved to `adminSettings.json`
3. The UI will update immediately to reflect your configuration

## Regenerating Settings

If you modify your Prisma schema:
1. Click **Regenerate from Schema**
2. Your relation configurations will be preserved
3. New relations will receive appropriate defaults