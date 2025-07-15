# Admin Architecture - Advanced Components

This document details advanced field components in `src/app/admin/_components/`.

## Files Covered
- `rich-text-editor.tsx` - WYSIWYG text editing
- `file-upload.tsx` - File upload with preview
- `csv-import.tsx` - CSV import dialog
- Components in `relations/` directory
- Settings components in `settings/` directory

## 1. rich-text-editor.tsx - Rich Text Editing

### Technology
Built with **TipTap** editor (headless rich text editor).

### Features

#### Editor Extensions
```typescript
const extensions = [
  StarterKit,           // Basic formatting
  Placeholder,          // Empty state
  Link,                // URL links
  Image,               // Inline images
  Table,               // Table support
  TableRow,
  TableCell,
  TableHeader,
]
```

#### Toolbar Controls
- Text formatting: Bold, Italic, Strike
- Headers: H1, H2, H3
- Lists: Bullet, Ordered
- Links: Add/edit URLs
- Tables: Insert and manage
- Code: Inline and blocks
- Clear formatting

#### Content Handling
- HTML input/output
- Preserves formatting
- XSS prevention built-in
- Image paste support

### Implementation
```typescript
const editor = useEditor({
  extensions,
  content: defaultValue,
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    onChange?.(html)
  },
})
```

## 2. file-upload.tsx - File Management

### Features

#### File Selection
- Drag and drop zone
- Click to browse
- Multiple file support
- File type restrictions

#### Preview Support
- Image thumbnails
- PDF preview (first page)
- File type icons
- File size display

#### Upload States
```typescript
interface FileState {
  file: File
  preview?: string
  progress: number
  error?: string
  url?: string
}
```

### Current Implementation
**Note**: Actual upload not implemented. Currently shows placeholder functionality.

```typescript
// TODO: Implement actual upload
// Options: S3, Cloudinary, local storage
const uploadedUrl = `uploads/${file.name}`
```

### UI Components
- Dropzone with dashed border
- Progress bars during upload
- Success/error indicators
- Remove buttons

## 3. csv-import.tsx - CSV Import Dialog

### Import Flow

#### 1. File Upload
```typescript
interface CSVImportProps {
  modelName: string
  fields: AdminField[]
  onComplete: () => void
}
```

#### 2. CSV Parsing
- Client-side parsing
- Preview first 5 rows
- Auto-detect headers
- Handle quoted values

#### 3. Field Mapping
```
CSV Column → Model Field
"Email"    → email
"Name"     → name
"Role"     → role
```

#### 4. Import Execution
- Server action call
- Progress tracking
- Error collection
- Results summary

### UI Components

#### Dialog Structure
```tsx
<Dialog>
  <DialogHeader>Import CSV</DialogHeader>
  <DialogContent>
    {step === 1 && <FileUpload />}
    {step === 2 && <FieldMapping />}
    {step === 3 && <ImportProgress />}
  </DialogContent>
</Dialog>
```

#### Mapping Interface
- Dropdown per CSV column
- Skip unmapped columns
- Required field validation
- Preview mapped data

#### Progress Display
- Record counter
- Success/failure counts
- Error messages
- Completion percentage

## 4. Relations Components

### relation-tabs.tsx - One-to-Many Display

#### Features
- Tabbed interface for relations
- Inline data tables
- Add/edit/delete in context
- Filtered by parent record

#### Implementation
```typescript
interface RelationTabsProps {
  parentModel: string
  parentId: string | number
  relations: RelationConfig[]
}

// Each tab shows filtered table
<DataTable
  data={relatedData}
  modelName={relation.model}
  // Filters by parent
/>
```

### relation-form.tsx - Inline Relation Forms

#### Create Related
- Modal with form
- Pre-filled parent relation
- Same form generator
- Refreshes parent on save

#### Edit Related
- Same as create
- Loads existing data
- Updates in place

## 5. Settings Components

### settings-sidebar.tsx - Navigation

#### Structure
```
Models
├── User
├── Post
├── Comment
└── [Add Model]

Settings
├── General
└── Advanced
```

#### Features
- Active state indication
- Model count badges
- Smooth transitions
- Mobile responsive

### model-settings-form.tsx - Model Configuration

#### General Tab
- Display name
- ID field selection
- Display fields (multi-select)
- Model permissions (CRUD)

#### Fields Tab
- Drag-drop reordering
- Field permission matrix
- Label customization
- Advanced options toggle

### field-settings-row.tsx - Field Configuration

#### Inline Editing
- Click to edit labels
- Toggle permissions
- Drag handle for reorder
- Expand for advanced

#### Permission Matrix
```
Field | Read | Create | Update | Filter | Sort
------|------|--------|--------|--------|-----
email | ✓    | ✓      | ✓      | ✓      | ✓
role  | ✓    | ✓      | ✓      | ✓      | ✗
```

### settings-layout.tsx - Container

#### Features
- Sidebar + content layout
- Responsive drawer on mobile
- Loading states
- Error boundaries

## Component Patterns

### 1. Dynamic Imports
Heavy components lazy loaded:
```typescript
const RichTextEditor = dynamic(
  () => import('./rich-text-editor'),
  { 
    ssr: false,
    loading: () => <Skeleton />
  }
)
```

### 2. Controlled/Uncontrolled Mix
- Form fields: Uncontrolled (FormData)
- Complex editors: Controlled
- File uploads: Managed state

### 3. Error Boundaries
Not implemented but planned:
```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <RichTextEditor />
</ErrorBoundary>
```

### 4. Loading States
Consistent patterns:
- Skeleton screens
- Progress indicators
- Disabled states
- Loading overlays

## State Management

### Local State
- File upload progress
- CSV parsing results
- Editor content
- Drag-drop state

### Server State
- Settings persistence
- Import progress
- Upload results

### URL State
- Active settings tab
- Selected model
- Dialog open states

## Performance Considerations

1. **Code splitting**: Dynamic imports for heavy components
2. **Debouncing**: Settings saves, search inputs
3. **Virtualization**: Not implemented for large lists
4. **Memoization**: Settings form inputs

## Security Notes

1. **File uploads**: Need server validation
2. **Rich text**: XSS prevention via TipTap
3. **CSV import**: Server-side validation
4. **Settings**: Permission checks needed

## Future Enhancements

1. **File Upload**
   - S3/Cloudinary integration
   - Virus scanning
   - Size limits
   - Batch uploads

2. **Rich Text**
   - Mention support
   - Collaborative editing
   - Custom blocks
   - Markdown mode

3. **Import/Export**
   - Excel support
   - Field transformations
   - Scheduled imports
   - Webhooks

4. **Settings**
   - Version history
   - Import/export config
   - Presets
   - API access