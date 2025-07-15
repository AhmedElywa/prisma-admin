export interface AdminSettings {
  models: AdminModel[]
  enums: EnumType[]
}

export interface AdminModel {
  id: string              // Prisma model name
  name: string            // Display name
  idField: string         // Primary key field
  displayFields: string[] // Fields shown in lists/relations
  create: boolean         // Allow creation
  update: boolean         // Allow updates
  delete: boolean         // Allow deletion
  fields: AdminField[]
}

export interface AdminField {
  id: string              // Unique identifier (Model.field)
  name: string            // Prisma field name
  title: string           // Display name
  type: string            // Field type (String, Int, etc.)
  kind: string            // Field kind (scalar, object, enum)
  list: boolean           // Is array field
  required: boolean       // Is required
  isId: boolean           // Is ID field
  unique: boolean         // Has unique constraint
  order: number           // Display order
  relationField?: boolean // Is relation field
  relationFrom?: string   // Related model
  relationTo?: string     // Related field
  relationName?: string   // Relation name
  // Table display
  read: boolean           // Show in views
  filter: boolean         // Allow filtering
  sort: boolean           // Allow sorting
  // Form input
  create: boolean         // Include in create
  update: boolean         // Include in update
  editor: boolean         // Use rich editor
  upload: boolean         // Enable uploads
  customRenderer?: string // Custom renderer key
  
  // Relation Display Settings
  relationDisplayMode?: 'dropdown' | 'tags' | 'count' | 'inline' | 'link' | 'badge'
  relationActions?: {
    filter?: boolean      // Show "Filter by this" option
    view?: boolean        // Show "View details" option
    edit?: boolean        // Show "Edit" option
    viewAll?: boolean     // Show "View all related" option
  }
  
  // Relation Edit Settings
  relationEditMode?: 'select' | 'autocomplete' | 'tags' | 'duallist' | 'modal' | 'inline' | 'checkbox'
  relationEditOptions?: {
    searchable?: boolean     // Enable search
    createable?: boolean     // Allow creating new records
    maxDisplay?: number      // Max items to show
    previewFields?: string[] // Fields to show in preview
    pageSize?: number        // Items per page in selection
    placeholder?: string     // Custom placeholder text
  }
  
  // Performance Settings
  relationLoadStrategy?: 'eager' | 'lazy' | 'ondemand'
  relationCacheTTL?: number // Cache duration in seconds
}

export interface EnumType {
  name: string
  fields: string[]
}

export interface QueryOptions {
  page?: number
  perPage?: number
  orderBy?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any> | any[]
}

export interface FormField extends AdminField {
  value?: any
  error?: string
}

export type FieldType = 
  | 'String'
  | 'Int'
  | 'BigInt'
  | 'Float'
  | 'Decimal'
  | 'Boolean'
  | 'DateTime'
  | 'Json'
  | 'Bytes'

export type FilterOperator = 
  | 'equals'
  | 'not'
  | 'in'
  | 'notIn'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'