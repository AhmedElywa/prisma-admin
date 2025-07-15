# Admin Architecture - Pages & Routing

This document details the page structure and routing in `src/app/admin/`.

## Directory Structure
```
src/app/admin/
├── layout.tsx              # Admin layout wrapper
├── page.tsx               # Dashboard/redirect
├── [model]/               # Dynamic model routes
│   ├── page.tsx          # List page
│   ├── new/              
│   │   └── page.tsx      # Create page
│   └── [id]/             
│       └── page.tsx      # Edit page
└── settings/              # Settings pages
    ├── page.tsx          # Settings redirect
    └── [modelId]/        
        └── page.tsx      # Model settings
```

## 1. layout.tsx - Admin Layout

### Structure
```typescript
export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1">
        <AdminHeader />
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### Components

#### AdminNav (Sidebar)
- Model list with icons
- Settings link
- Active state indication
- Collapsible on mobile

#### AdminHeader
- Breadcrumbs
- User menu
- Global actions
- Search (planned)

### Features
- Responsive layout
- Consistent spacing
- Loading states
- Error boundaries (planned)

## 2. Dashboard Page

### Current Implementation
```typescript
// app/admin/page.tsx
export default function AdminDashboard() {
  redirect('/admin/user')  // Temporary redirect
}
```

### Planned Features
- Model overview cards
- Recent activity
- Quick stats
- System health

## 3. Dynamic Model Routes

### [model]/page.tsx - List Page

#### Page Params
```typescript
interface PageProps {
  params: { model: string }
  searchParams: {
    page?: string
    sort?: string
    order?: string
    search?: string
    filters?: string
  }
}
```

#### Data Loading
```typescript
async function ModelListPage({ params, searchParams }: PageProps) {
  const modelName = normalizeModelName(params.model)
  
  // Check permissions
  if (!await canReadModel(modelName)) {
    notFound()
  }
  
  // Load data with options from URL
  const data = await getModelData(modelName, {
    page: parseInt(searchParams.page || '1'),
    orderBy: searchParams.sort,
    order: searchParams.order as 'asc' | 'desc',
    search: searchParams.search,
    filters: searchParams.filters 
      ? JSON.parse(decodeURIComponent(searchParams.filters))
      : undefined
  })
  
  return <DataTable {...data} />
}
```

#### Components Rendered
1. Page header with title
2. Model header actions (create, import/export)
3. Data table with filters
4. Pagination controls

### [model]/new/page.tsx - Create Page

#### Data Preparation
```typescript
async function CreatePage({ params }: PageProps) {
  const modelName = normalizeModelName(params.model)
  
  // Check permissions
  if (!await canCreateModel(modelName)) {
    notFound()
  }
  
  // Get form fields
  const fields = await getFormFieldsData(modelName)
  
  return (
    <FormGenerator
      fields={fields}
      action={createAction}
      modelName={modelName}
      submitLabel="Create"
      cancelHref={`/admin/${params.model}`}
    />
  )
}
```

#### Server Action
```typescript
async function createAction(formData: FormData) {
  'use server'
  await createModelRecord(modelName, formData)
  redirect(`/admin/${modelName.toLowerCase()}`)
}
```

### [model]/[id]/page.tsx - Edit Page

#### Features
- Loads existing record
- Pre-fills form values
- Relation management tabs
- Delete option

#### Data Loading
```typescript
async function EditPage({ params }: PageProps) {
  const modelName = normalizeModelName(params.model)
  const record = await getModelRecord(modelName, params.id)
  
  if (!record) {
    notFound()
  }
  
  // Get fields with values
  const fields = await getUpdateFieldsData(modelName, record)
  
  return (
    <>
      <FormGenerator
        fields={fields}
        action={updateAction}
        modelName={modelName}
        submitLabel="Update"
        cancelHref={`/admin/${params.model}`}
      />
      <RelationTabs
        parentModel={modelName}
        parentId={params.id}
      />
    </>
  )
}
```

## 4. Settings Pages

### settings/page.tsx - Settings Landing

```typescript
export default function SettingsPage() {
  const firstModel = await getFirstModel()
  redirect(`/admin/settings/${firstModel.id.toLowerCase()}`)
}
```

### settings/[modelId]/page.tsx - Model Settings

#### Layout
- Sidebar with model list
- Main content area
- Save/reset actions

#### Tabs
1. **General**: Model-level settings
2. **Fields**: Field configuration

#### Features
- Real-time preview
- Bulk operations
- Reset to defaults
- Import/export (planned)

## Routing Patterns

### 1. Dynamic Model Routes
All models share the same route pattern:
```
/admin/user         → User list
/admin/user/new     → Create user
/admin/user/123     → Edit user 123
/admin/post         → Post list
/admin/post/new     → Create post
/admin/post/abc-123 → Edit post abc-123
```

### 2. Model Name Normalization
```typescript
function normalizeModelName(slug: string): string {
  // user → User
  // blog-post → BlogPost
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
```

### 3. URL State Management
List pages maintain state in URL:
- Pagination: `?page=2`
- Sorting: `?sort=createdAt&order=desc`
- Search: `?search=john`
- Filters: `?filters=%5B%7B%22field%22%3A%22role%22%7D%5D`

## Page Components Integration

### Data Flow
```
URL Params → Page Component → Server Action → Database
                    ↓
              UI Components ← Admin Settings
```

### Permission Checks
Every page checks permissions:
```typescript
if (!await canReadModel(modelName)) {
  notFound()  // Returns 404
}
```

### Error Handling
- Invalid models → 404
- Permission denied → 404
- Server errors → Error boundary
- Validation errors → Form errors

## SEO & Metadata

### Dynamic Metadata
```typescript
export async function generateMetadata({ params }: PageProps) {
  const model = await getModelSettings(params.model)
  return {
    title: `${model.name} - Admin`,
    description: `Manage ${model.name} records`
  }
}
```

### Static Metadata
```typescript
export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your application data'
}
```

## Performance Optimizations

### 1. Server Components
All pages are server components:
- No client-side data fetching
- Direct database access
- Reduced JavaScript bundle

### 2. Streaming (Planned)
```typescript
export default async function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DataTableWrapper />
    </Suspense>
  )
}
```

### 3. Parallel Data Loading
```typescript
const [settings, data, filters] = await Promise.all([
  getModelSettings(modelName),
  getModelData(modelName, options),
  getFilterableFields(modelName)
])
```

## Navigation Patterns

### Breadcrumbs
```
Admin > Users > Edit > John Doe
Admin > Settings > Post
```

### Back Navigation
- Cancel buttons → List page
- Save → Stay on page
- Save & Close → List page
- Delete → List page

### Keyboard Shortcuts (Planned)
- `Cmd+S` → Save
- `Esc` → Cancel
- `Cmd+Enter` → Save & Close

## Mobile Considerations

### Responsive Layouts
- Sidebar → Drawer on mobile
- Tables → Horizontal scroll
- Forms → Single column
- Actions → Bottom sheet

### Touch Optimizations
- Larger tap targets
- Swipe gestures (planned)
- Pull to refresh (planned)

## Future Enhancements

1. **Dashboard Page**
   - Widget system
   - Customizable layout
   - Real-time updates
   - Analytics integration

2. **Routing**
   - Nested routes for relations
   - Modal routes
   - Parallel routes
   - Route groups

3. **Performance**
   - Incremental static regeneration
   - Edge runtime
   - Partial prerendering
   - Route prefetching

4. **Features**
   - Bulk edit pages
   - Comparison views
   - History/audit pages
   - Import status pages