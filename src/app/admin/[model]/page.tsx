import { notFound } from 'next/navigation'
import { DataTable } from '@/app/admin/_components/data-table'
import { ModelHeaderActions } from '@/app/admin/_components/model-header-actions'
import { 
  getModelSettings, 
  getTableFields,
  canCreateModel,
  canDeleteModel,
  getColumnType,
  getFilterableFields,
  getAdminSettings
} from '@/lib/admin/settings'
import { getModelData } from '@/lib/actions/crud'
import { getRelationFilterFields } from '@/lib/actions/filter-actions'
import { FilterConfig, FilterValue } from '@/app/admin/_components/filters/types'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ model: string }> 
}) {
  const { model } = await params
  const modelSettings = await getModelSettings(model)
  if (!modelSettings) return { title: 'Not Found' }
  
  return {
    title: `${modelSettings.name} - Admin`,
  }
}

export default async function ModelListPage({
  params,
  searchParams,
}: {
  params: Promise<{ model: string }>
  searchParams: Promise<{ 
    page?: string
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
    filters?: string
  }>
}) {
  const { model } = await params
  const search = await searchParams
  const modelName = model.charAt(0).toUpperCase() + model.slice(1)
  const modelSettings = await getModelSettings(modelName)
  
  if (!modelSettings) {
    notFound()
  }
  
  // Get table fields from settings
  const fields = await getTableFields(modelName)
  
  // Get filterable fields
  const filterableFields = await getFilterableFields(modelName)
  
  // Build columns configuration
  const columns = fields.map(field => ({
    key: field.name,
    label: field.title,
    type: getColumnType(field),
    sortable: field.sort,
    isRelation: field.kind === 'object',
    relationTo: field.type, // The related model name
    relationFrom: field.relationFrom, // The foreign key field
    isList: field.list, // Whether it's a one-to-many relation
    field: field // Pass full field metadata for relations
  }))
  
  // Parse filters from URL
  const filters: FilterValue[] = search.filters 
    ? JSON.parse(decodeURIComponent(search.filters))
    : []
  
  // Build filter configs
  const settings = await getAdminSettings()
  const filterConfigs: FilterConfig[] = filterableFields.map(field => ({
    field: field.name,
    label: field.title,
    type: field.type,
    kind: field.kind,
    list: field.list,
    relationTo: field.relationFrom,
    enumValues: field.kind === 'enum' 
      ? settings.enums.find(e => e.name === field.type)?.fields
      : undefined
  }))
  
  // Get data with pagination and filters
  const { 
    data, 
    totalCount, 
    page, 
    perPage, 
    totalPages 
  } = await getModelData(modelName, {
    page: parseInt(search.page || '1'),
    perPage: 10,
    orderBy: search.sort,
    order: search.order,
    search: search.search,
    filters: filters.length > 0 ? filters : undefined
  })
  
  const canCreate = await canCreateModel(modelName)
  const canDelete = await canDeleteModel(modelName)
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{modelSettings.name}</h1>
        <ModelHeaderActions
          modelName={modelName}
          modelPath={model}
          canCreate={canCreate}
          fields={modelSettings.fields}
        />
      </div>
      
      <DataTable
        data={data}
        columns={columns}
        totalItems={totalCount}
        currentPage={page}
        itemsPerPage={perPage}
        totalPages={totalPages}
        searchValue={search.search}
        modelName={modelName}
        canEdit={modelSettings.update}
        canDelete={canDelete}
        filterFields={filterConfigs}
        getRelationFields={getRelationFilterFields}
      />
    </div>
  )
}