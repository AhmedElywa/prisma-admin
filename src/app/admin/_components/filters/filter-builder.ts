import type { WhereInput } from '@/lib/prisma-types';
import type { FilterValue } from './types';

// Helper function to build comparison operators
function buildComparisonFilter(operator: string, value: any) {
  const comparisons: Record<string, any> = {
    lt: { lt: value },
    lte: { lte: value },
    gt: { gt: value },
    gte: { gte: value },
    not: { not: value },
    in: { in: Array.isArray(value) ? value : [value] },
    notIn: { notIn: Array.isArray(value) ? value : [value] },
  };
  return comparisons[operator];
}

// Helper function to build string operators
function buildStringFilter(operator: string, value: any) {
  const stringOps: Record<string, any> = {
    contains: { contains: value, mode: 'insensitive' },
    startsWith: { startsWith: value, mode: 'insensitive' },
    endsWith: { endsWith: value, mode: 'insensitive' },
    string_contains: { string_contains: value, mode: 'insensitive' },
    string_starts_with: { string_starts_with: value, mode: 'insensitive' },
    string_ends_with: { string_ends_with: value, mode: 'insensitive' },
  };
  return stringOps[operator];
}

// Helper function to build array operators
function buildArrayFilter(operator: string, value: any) {
  const arrayOps: Record<string, any> = {
    array_contains: { array_contains: value },
    array_starts_with: { array_starts_with: value },
    array_ends_with: { array_ends_with: value },
  };
  return arrayOps[operator];
}

// Helper to build filter value
function buildFilterValue(operator: string, value: any, type?: string) {
  // Handle special cases
  if (operator === 'equals') {
    return value;
  }
  if (type === 'relation') {
    return { [operator]: value };
  }

  // Try operator groups
  const filter =
    buildComparisonFilter(operator, value) ||
    buildStringFilter(operator, value) ||
    buildArrayFilter(operator, value);

  return filter || value;
}

export function buildPrismaWhere(
  filters: FilterValue[]
): WhereInput | undefined {
  if (!filters || filters.length === 0) {
    return;
  }

  const where: WhereInput = {};

  for (const filter of filters) {
    const { field, operator, value, type } = filter;

    // Handle null operators
    if (operator === 'isNull') {
      where[field] = null;
      continue;
    }
    if (operator === 'isNotNull') {
      where[field] = { not: null };
      continue;
    }

    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Build and assign filter value
    where[field] = buildFilterValue(operator, value, type);
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

// Merge filters with search conditions
export function mergeWhereConditions(
  filterWhere: WhereInput | undefined,
  searchWhere: WhereInput | undefined
): WhereInput | undefined {
  if (!(filterWhere || searchWhere)) {
    return;
  }
  if (!filterWhere) {
    return searchWhere;
  }
  if (!searchWhere) {
    return filterWhere;
  }

  // If both exist, combine with AND
  return {
    AND: [filterWhere, searchWhere],
  };
}
