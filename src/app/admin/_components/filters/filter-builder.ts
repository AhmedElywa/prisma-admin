import { FilterValue } from './types'
import { WhereInput } from '@/lib/prisma-types'

export function buildPrismaWhere(filters: FilterValue[]): WhereInput | undefined {
  if (!filters || filters.length === 0) return undefined
  
  const where: WhereInput = {}
  
  for (const filter of filters) {
    const { field, operator, value, type, mode } = filter
    
    // Handle null/not null operators
    if (operator === 'isNull') {
      where[field] = null
      continue
    }
    
    if (operator === 'isNotNull') {
      where[field] = { not: null }
      continue
    }
    
    // Skip if no value provided (except for null operators)
    if (value === undefined || value === null || value === '') {
      continue
    }
    
    // Handle relation filters
    if (type === 'relation') {
      where[field] = { [operator]: value }
      continue
    }
    
    // Build filter based on operator
    switch (operator) {
      case 'equals':
        where[field] = value
        break
        
      case 'not':
        where[field] = { not: value }
        break
        
      case 'in':
        where[field] = { in: Array.isArray(value) ? value : [value] }
        break
        
      case 'notIn':
        where[field] = { notIn: Array.isArray(value) ? value : [value] }
        break
        
      case 'lt':
        where[field] = { lt: value }
        break
        
      case 'lte':
        where[field] = { lte: value }
        break
        
      case 'gt':
        where[field] = { gt: value }
        break
        
      case 'gte':
        where[field] = { gte: value }
        break
        
      case 'contains':
        where[field] = { 
          contains: value,
          ...(mode && { mode })
        }
        break
        
      case 'startsWith':
        where[field] = { 
          startsWith: value,
          ...(mode && { mode })
        }
        break
        
      case 'endsWith':
        where[field] = { 
          endsWith: value,
          ...(mode && { mode })
        }
        break
        
      // JSON specific operators
      case 'string_contains':
        where[field] = { string_contains: value, ...(mode && { mode }) }
        break
        
      case 'string_starts_with':
        where[field] = { string_starts_with: value, ...(mode && { mode }) }
        break
        
      case 'string_ends_with':
        where[field] = { string_ends_with: value, ...(mode && { mode }) }
        break
        
      case 'array_contains':
        where[field] = { array_contains: value }
        break
        
      case 'array_starts_with':
        where[field] = { array_starts_with: value }
        break
        
      case 'array_ends_with':
        where[field] = { array_ends_with: value }
        break
        
      default:
        where[field] = value
    }
  }
  
  return Object.keys(where).length > 0 ? where : undefined
}

// Merge filters with search conditions
export function mergeWhereConditions(
  filterWhere: WhereInput | undefined,
  searchWhere: WhereInput | undefined
): WhereInput | undefined {
  if (!filterWhere && !searchWhere) return undefined
  if (!filterWhere) return searchWhere
  if (!searchWhere) return filterWhere
  
  // If both exist, combine with AND
  return {
    AND: [filterWhere, searchWhere]
  }
}