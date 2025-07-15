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
  | 'isNull'
  | 'isNotNull'
  // Relation operators
  | 'is'
  | 'isNot'
  | 'every'
  | 'some'
  | 'none'
  // JSON operators
  | 'string_contains'
  | 'string_starts_with'
  | 'string_ends_with'
  | 'array_contains'
  | 'array_starts_with'
  | 'array_ends_with'
  | 'is'
  | 'isNot'
  | 'every'
  | 'some'
  | 'none'
  | 'string_contains'
  | 'string_starts_with'
  | 'string_ends_with'
  | 'array_contains'
  | 'array_starts_with'
  | 'array_ends_with'

export type StringFilterOperator = 
  | 'equals'
  | 'not'
  | 'in'
  | 'notIn'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'isNull'
  | 'isNotNull'

export type NumberFilterOperator = 
  | 'equals'
  | 'not'
  | 'in'
  | 'notIn'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'isNull'
  | 'isNotNull'

export type DateFilterOperator = 
  | 'equals'
  | 'not'
  | 'in'
  | 'notIn'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'isNull'
  | 'isNotNull'

export type BooleanFilterOperator = 
  | 'equals'
  | 'not'
  | 'isNull'
  | 'isNotNull'

export type JsonFilterOperator = 
  | 'equals'
  | 'not'
  | 'string_contains'
  | 'string_starts_with'
  | 'string_ends_with'
  | 'array_contains'
  | 'array_starts_with'
  | 'array_ends_with'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'isNull'
  | 'isNotNull'

export type RelationFilterOperator = 
  | 'is'
  | 'isNot'
  | 'every'
  | 'some'
  | 'none'

export interface FilterValue {
  field: string
  operator: FilterOperator
  value: any
  type?: string
  mode?: 'insensitive' | 'sensitive' | 'default'
}

export interface FilterConfig {
  field: string
  label: string
  type: string
  kind?: string
  list?: boolean
  relationTo?: string
  enumValues?: string[]
}

export interface FilterState {
  filters: FilterValue[]
}

export const getOperatorsForType = (type: string, kind?: string): FilterOperator[] => {
  if (kind === 'object') {
    return ['is', 'isNot']
  }
  
  if (kind === 'enum') {
    return ['equals', 'not', 'in', 'notIn', 'isNull', 'isNotNull']
  }
  
  switch (type) {
    case 'String':
      return ['equals', 'not', 'in', 'notIn', 'contains', 'startsWith', 'endsWith', 'isNull', 'isNotNull']
    case 'Int':
    case 'BigInt':
    case 'Float':
    case 'Decimal':
      return ['equals', 'not', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte', 'isNull', 'isNotNull']
    case 'Boolean':
      return ['equals', 'not', 'isNull', 'isNotNull']
    case 'DateTime':
      return ['equals', 'not', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte', 'isNull', 'isNotNull']
    case 'Json':
      return ['equals', 'not', 'string_contains', 'string_starts_with', 'string_ends_with', 
              'array_contains', 'array_starts_with', 'array_ends_with', 'lt', 'lte', 'gt', 'gte', 'isNull', 'isNotNull']
    default:
      return ['equals', 'not', 'isNull', 'isNotNull']
  }
}

export const getOperatorLabel = (operator: FilterOperator): string => {
  switch (operator) {
    case 'equals': return 'Equals'
    case 'not': return 'Not equals'
    case 'in': return 'In'
    case 'notIn': return 'Not in'
    case 'lt': return 'Less than'
    case 'lte': return 'Less than or equal'
    case 'gt': return 'Greater than'
    case 'gte': return 'Greater than or equal'
    case 'contains': return 'Contains'
    case 'startsWith': return 'Starts with'
    case 'endsWith': return 'Ends with'
    case 'isNull': return 'Is empty'
    case 'isNotNull': return 'Is not empty'
    case 'is': return 'Is'
    case 'isNot': return 'Is not'
    case 'every': return 'Every'
    case 'some': return 'Some'
    case 'none': return 'None'
    case 'string_contains': return 'String contains'
    case 'string_starts_with': return 'String starts with'
    case 'string_ends_with': return 'String ends with'
    case 'array_contains': return 'Array contains'
    case 'array_starts_with': return 'Array starts with'
    case 'array_ends_with': return 'Array ends with'
    default: return operator
  }
}

export const needsValue = (operator: FilterOperator): boolean => {
  return !['isNull', 'isNotNull'].includes(operator)
}

export const isMultiValue = (operator: FilterOperator): boolean => {
  return ['in', 'notIn'].includes(operator)
}