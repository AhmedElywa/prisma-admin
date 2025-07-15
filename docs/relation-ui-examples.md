# Relation UI Examples

This document provides visual examples of how different relation configurations appear in the admin interface.

## Display Modes

### Dropdown Display
Best for: Many-to-one relations with actions

```typescript
relationDisplayMode: 'dropdown'
```

**Features:**
- Clickable dropdown with multiple actions
- Shows relation value as button text
- Actions: Filter, View, Edit, View All

**Example:** Post → Author
```
[John Doe ▼]
  ├─ Filter by Author
  ├─ View Author
  ├─ Edit Relation
  └─ View All by Author
```

### Tags Display
Best for: Many-to-many relations

```typescript
relationDisplayMode: 'tags'
```

**Features:**
- Multiple pill badges
- Click to filter
- Shows overflow count
- Hover for tooltip

**Example:** Post → Tags
```
[React] [TypeScript] [+3 more]
```

### Count Display
Best for: One-to-many relations

```typescript
relationDisplayMode: 'count'
```

**Features:**
- Shows count with icon
- Hover preview
- Click to view all

**Example:** User → Posts
```
📄 12 posts
```

### Inline Display
Best for: Detailed views

```typescript
relationDisplayMode: 'inline'
```

**Features:**
- Shows full record details
- Multiple fields visible
- No extra clicks needed

**Example:** Profile → User
```
User: John Doe (john@example.com)
```

### Badge Display
Best for: Compact layouts

```typescript
relationDisplayMode: 'badge'
```

**Features:**
- Minimal space usage
- Single value display
- Optional click action

**Example:** Post → Category
```
[Technology]
```

### Link Display
Best for: Simple navigation

```typescript
relationDisplayMode: 'link'
```

**Features:**
- Simple underlined link
- Direct navigation
- Minimal UI

**Example:** Comment → Post
```
View Post →
```

## Edit Modes

### Select Edit
Best for: Small datasets (<50 items)

```typescript
relationEditMode: 'select'
```

**UI:**
```
┌─────────────────────┐
│ Select Author...  ▼ │
├─────────────────────┤
│ ☐ John Doe         │
│ ☑ Jane Smith       │
│ ☐ Bob Johnson      │
└─────────────────────┘
```

### Autocomplete Edit
Best for: Large datasets

```typescript
relationEditMode: 'autocomplete'
```

**UI:**
```
┌─────────────────────┐
│ 🔍 Type to search...│
├─────────────────────┤
│ > John Doe          │
│ > John Smith        │
│ > Johnny Walker     │
└─────────────────────┘
```

### Tags Edit
Best for: Many-to-many relations

```typescript
relationEditMode: 'tags'
```

**UI:**
```
┌─────────────────────────────┐
│ [React ×] [Node.js ×]     + │
├─────────────────────────────┤
│ Available Tags:             │
│ ☐ TypeScript               │
│ ☐ GraphQL                  │
│ ☐ Prisma                   │
└─────────────────────────────┘
```

### Dual List Edit
Best for: Many selections from large sets

```typescript
relationEditMode: 'duallist'
```

**UI:**
```
Available          Selected
┌─────────┐  →   ┌─────────┐
│ User 1  │  ←   │ User 5  │
│ User 2  │  ⇒   │ User 8  │
│ User 3  │  ⇐   │ User 9  │
└─────────┘      └─────────┘
```

### Checkbox Edit
Best for: Small many-to-many (<20 items)

```typescript
relationEditMode: 'checkbox'
```

**UI:**
```
Select Categories:
☑ Technology
☐ Science
☑ Programming
☐ Design
```

### Modal Edit
Best for: Complex selections

```typescript
relationEditMode: 'modal'
```

**UI:**
```
Current: 3 items selected
[Change Selection]
  ↓
┌─ Select Items ────────────┐
│ Search: [___________] 🔍  │
│                           │
│ ☑ Item 1    ☐ Item 4    │
│ ☑ Item 2    ☐ Item 5    │
│ ☑ Item 3    ☐ Item 6    │
│                           │
│ [Cancel]  [Save Selection]│
└───────────────────────────┘
```

### Inline Edit
Best for: One-to-one relations

```typescript
relationEditMode: 'inline'
```

**UI:**
```
Profile Details:
┌─────────────────────────┐
│ Bio: [_______________]  │
│ Avatar: [Upload]        │
│ Website: [___________]  │
└─────────────────────────┘
```

## Configuration Examples

### E-commerce Product Categories
```json
{
  "relationDisplayMode": "tags",
  "relationEditMode": "checkbox",
  "relationEditOptions": {
    "maxDisplay": 3,
    "previewFields": ["name"]
  },
  "relationActions": {
    "filter": true,
    "viewAll": true
  }
}
```

### Blog Post Author
```json
{
  "relationDisplayMode": "dropdown",
  "relationEditMode": "select",
  "relationEditOptions": {
    "searchable": true,
    "previewFields": ["name", "email"]
  },
  "relationActions": {
    "filter": true,
    "view": true,
    "edit": true
  }
}
```

### User Roles (Many-to-Many)
```json
{
  "relationDisplayMode": "tags",
  "relationEditMode": "duallist",
  "relationEditOptions": {
    "searchable": true,
    "maxDisplay": 5,
    "previewFields": ["name", "description"]
  },
  "relationLoadStrategy": "lazy"
}
```

### Order Items (One-to-Many)
```json
{
  "relationDisplayMode": "count",
  "relationEditMode": "modal",
  "relationEditOptions": {
    "pageSize": 50,
    "previewFields": ["name", "price", "quantity"]
  },
  "relationLoadStrategy": "ondemand"
}
```

## Performance Considerations

### Small Relations (<50 items)
- Use eager loading
- Simple select/checkbox edit
- Inline or dropdown display

### Medium Relations (50-500 items)
- Use lazy loading
- Searchable selects
- Tags or count display

### Large Relations (>500 items)
- Use on-demand loading
- Autocomplete or modal edit
- Count display with pagination

## Accessibility

All relation UI components support:
- Keyboard navigation
- Screen reader announcements
- Focus indicators
- ARIA labels
- High contrast mode