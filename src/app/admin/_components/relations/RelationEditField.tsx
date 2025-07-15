'use client'

import { AdminField } from '@/lib/admin/types'
import { RelationSelect } from './edit/RelationSelect'
import { RelationAutocomplete } from './edit/RelationAutocomplete'
import { RelationTagInput } from './edit/RelationTagInput'
import { RelationDualList } from './edit/RelationDualList'
import { RelationModal } from './edit/RelationModal'
import { RelationInlineEdit } from './edit/RelationInlineEdit'
import { RelationCheckbox } from './edit/RelationCheckbox'

interface RelationEditFieldProps {
  field: AdminField
  name: string
  label: string
  value?: any
  required?: boolean
  disabled?: boolean
  placeholder?: string
  relatedModel: string
  modelId?: string
  modelName?: string
}

export function RelationEditField({
  field,
  name,
  label,
  value,
  required,
  disabled,
  placeholder,
  relatedModel,
  modelId,
  modelName,
}: RelationEditFieldProps) {
  // Get the edit mode from field settings
  const editMode = field.relationEditMode || (field.list ? 'tags' : 'select')
  
  // Common props for all edit components
  const commonProps = {
    name,
    label,
    value,
    required,
    disabled,
    placeholder,
    relatedModel,
    field,
  }
  
  // Render the appropriate edit component based on mode
  switch (editMode) {
    case 'select':
      return <RelationSelect {...commonProps} />
      
    case 'autocomplete':
      return <RelationAutocomplete {...commonProps} />
      
    case 'tags':
      return <RelationTagInput {...commonProps} />
      
    case 'duallist':
      return <RelationDualList {...commonProps} />
      
    case 'modal':
      return <RelationModal {...commonProps} modelId={modelId} modelName={modelName} />
      
    case 'inline':
      return <RelationInlineEdit {...commonProps} />
      
    case 'checkbox':
      return <RelationCheckbox {...commonProps} />
      
    default:
      // Fallback to select for single relations, tags for multiple
      if (field.list) {
        return <RelationTagInput {...commonProps} />
      }
      return <RelationSelect {...commonProps} />
  }
}