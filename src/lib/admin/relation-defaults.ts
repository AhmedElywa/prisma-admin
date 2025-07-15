import { AdminField } from './types'

export type RelationType = 'one-to-one' | 'many-to-one' | 'one-to-many' | 'many-to-many'

interface RelationDefaults {
  relationDisplayMode: AdminField['relationDisplayMode']
  relationActions: AdminField['relationActions']
  relationEditMode: AdminField['relationEditMode']
  relationEditOptions: AdminField['relationEditOptions']
  relationLoadStrategy: AdminField['relationLoadStrategy']
}

// Smart defaults based on relation type
export const RELATION_DEFAULTS: Record<RelationType, RelationDefaults> = {
  'one-to-one': {
    relationDisplayMode: 'link',
    relationActions: {
      filter: false,
      view: true,
      edit: true,
      viewAll: false
    },
    relationEditMode: 'inline',
    relationEditOptions: {
      searchable: false,
      createable: false,
      maxDisplay: 1,
      previewFields: ['id', 'name', 'title']
    },
    relationLoadStrategy: 'eager'
  },
  
  'many-to-one': {
    relationDisplayMode: 'dropdown',
    relationActions: {
      filter: true,
      view: true,
      edit: true,
      viewAll: true
    },
    relationEditMode: 'select',
    relationEditOptions: {
      searchable: true,
      createable: false,
      maxDisplay: 1,
      previewFields: ['id', 'name', 'title', 'email'],
      placeholder: 'Select...'
    },
    relationLoadStrategy: 'lazy'
  },
  
  'one-to-many': {
    relationDisplayMode: 'count',
    relationActions: {
      filter: false,
      view: false,
      edit: false,
      viewAll: true
    },
    relationEditMode: 'modal',
    relationEditOptions: {
      searchable: true,
      createable: true,
      maxDisplay: 10,
      pageSize: 10,
      previewFields: ['id', 'name', 'title']
    },
    relationLoadStrategy: 'ondemand'
  },
  
  'many-to-many': {
    relationDisplayMode: 'tags',
    relationActions: {
      filter: true,
      view: false,
      edit: false,
      viewAll: true
    },
    relationEditMode: 'tags',
    relationEditOptions: {
      searchable: true,
      createable: true,
      maxDisplay: 3,
      pageSize: 20,
      previewFields: ['id', 'name'],
      placeholder: 'Add tags...'
    },
    relationLoadStrategy: 'lazy'
  }
}

// Get defaults based on dataset size
export function getRelationDefaultsBySize(
  relationType: RelationType,
  estimatedCount: number
): Partial<RelationDefaults> {
  const baseDefaults = { ...RELATION_DEFAULTS[relationType] }
  
  // Adjust for dataset size
  if (relationType === 'many-to-one' || relationType === 'one-to-one') {
    if (estimatedCount < 50) {
      baseDefaults.relationEditMode = 'select'
      baseDefaults.relationEditOptions = {
        ...baseDefaults.relationEditOptions,
        searchable: false
      }
    } else if (estimatedCount < 500) {
      baseDefaults.relationEditMode = 'select'
      baseDefaults.relationEditOptions = {
        ...baseDefaults.relationEditOptions,
        searchable: true
      }
    } else {
      baseDefaults.relationEditMode = 'autocomplete'
      baseDefaults.relationLoadStrategy = 'ondemand'
    }
  }
  
  if (relationType === 'many-to-many') {
    if (estimatedCount < 20) {
      baseDefaults.relationEditMode = 'checkbox'
      baseDefaults.relationDisplayMode = 'inline'
    } else if (estimatedCount < 100) {
      baseDefaults.relationEditMode = 'tags'
      baseDefaults.relationDisplayMode = 'tags'
    } else {
      baseDefaults.relationEditMode = 'duallist'
      baseDefaults.relationDisplayMode = 'count'
    }
  }
  
  return baseDefaults
}

// Preset configurations for different use cases
export const RELATION_PRESETS = {
  compact: {
    // Minimal space usage, good for dense tables
    'one-to-one': {
      relationDisplayMode: 'badge' as const,
      relationEditMode: 'modal' as const
    },
    'many-to-one': {
      relationDisplayMode: 'badge' as const,
      relationEditMode: 'modal' as const
    },
    'one-to-many': {
      relationDisplayMode: 'count' as const,
      relationEditMode: 'modal' as const
    },
    'many-to-many': {
      relationDisplayMode: 'count' as const,
      relationEditMode: 'modal' as const
    }
  },
  
  rich: {
    // Maximum information display
    'one-to-one': {
      relationDisplayMode: 'inline' as const,
      relationEditMode: 'inline' as const
    },
    'many-to-one': {
      relationDisplayMode: 'dropdown' as const,
      relationEditMode: 'inline' as const
    },
    'one-to-many': {
      relationDisplayMode: 'inline' as const,
      relationEditMode: 'inline' as const,
      relationEditOptions: { maxDisplay: 5 }
    },
    'many-to-many': {
      relationDisplayMode: 'tags' as const,
      relationEditMode: 'tags' as const,
      relationEditOptions: { maxDisplay: 5 }
    }
  },
  
  performance: {
    // Optimized for large datasets
    'one-to-one': {
      relationDisplayMode: 'link' as const,
      relationEditMode: 'modal' as const,
      relationLoadStrategy: 'lazy' as const
    },
    'many-to-one': {
      relationDisplayMode: 'link' as const,
      relationEditMode: 'autocomplete' as const,
      relationLoadStrategy: 'ondemand' as const
    },
    'one-to-many': {
      relationDisplayMode: 'count' as const,
      relationEditMode: 'modal' as const,
      relationLoadStrategy: 'ondemand' as const
    },
    'many-to-many': {
      relationDisplayMode: 'count' as const,
      relationEditMode: 'modal' as const,
      relationLoadStrategy: 'ondemand' as const
    }
  }
}

// Helper to determine relation type from field metadata
export function getRelationType(field: AdminField): RelationType | null {
  if (!field.relationField) return null
  
  // Check if it's a list relation (one-to-many or many-to-many)
  if (field.list) {
    // Many-to-many relations don't have a relationFrom field
    // One-to-many relations will have a relationFrom pointing to the foreign key in the other model
    return !field.relationFrom ? 'many-to-many' : 'one-to-many'
  }
  
  // Check if it's one-to-one (unique foreign key)
  if (field.unique && field.relationFrom) {
    return 'one-to-one'
  }
  
  // Default to many-to-one for non-list relations
  return 'many-to-one'
}

// Apply defaults to a field
export function applyRelationDefaults(
  field: AdminField,
  estimatedCount?: number,
  preset?: keyof typeof RELATION_PRESETS
): AdminField {
  const relationType = getRelationType(field)
  if (!relationType) return field
  
  // Get base defaults
  let defaults = estimatedCount 
    ? getRelationDefaultsBySize(relationType, estimatedCount)
    : RELATION_DEFAULTS[relationType]
  
  // Apply preset if specified
  if (preset && RELATION_PRESETS[preset][relationType]) {
    defaults = {
      ...defaults,
      ...RELATION_PRESETS[preset][relationType]
    }
  }
  
  // Merge with existing field settings (existing settings take precedence)
  return {
    ...field,
    relationDisplayMode: field.relationDisplayMode || defaults.relationDisplayMode,
    relationActions: field.relationActions || defaults.relationActions,
    relationEditMode: field.relationEditMode || defaults.relationEditMode,
    relationEditOptions: field.relationEditOptions || defaults.relationEditOptions,
    relationLoadStrategy: field.relationLoadStrategy || defaults.relationLoadStrategy
  }
}