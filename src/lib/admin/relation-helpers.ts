'use server';

import { getAdminSettings } from './settings';
import type { AdminField } from './types';

/**
 * Find the inverse relation field in the target model
 *
 * @param currentModelName - The current model name (e.g., "User")
 * @param field - The relation field (e.g., User.posts)
 * @returns The inverse field name in the target model (e.g., "author")
 */
export async function getInverseRelationField(
  currentModelName: string,
  field: AdminField
): Promise<string | null> {
  if (!(field.relationField && field.relationName)) {
    return null;
  }

  const settings = await getAdminSettings();
  const targetModel = settings.models.find((m) => m.name === field.type);

  if (!targetModel) {
    return null;
  }

  // Find the field in the target model with the same relationName
  const inverseField = targetModel.fields.find(
    (f) => f.relationName === field.relationName && f.type === currentModelName
  );

  // Return the foreign key field (relationFrom) instead of the relation field name
  return inverseField?.relationFrom || null;
}

/**
 * Get filter configuration for "view all" navigation on relations
 *
 * @param currentModelName - The current model name (e.g., "User")
 * @param field - The relation field (e.g., User.posts)
 * @param parentId - The parent record ID
 * @returns Filter configuration for the target model
 */
export async function getRelationViewAllFilter(
  currentModelName: string,
  field: AdminField,
  parentId: string | number
): Promise<{
  field: string;
  operator: string;
  value: any;
  type?: string;
} | null> {
  const settings = await getAdminSettings();
  const targetModel = settings.models.find((m) => m.name === field.type);

  if (!targetModel) {
    return null;
  }

  // Check if this is a many-to-many relation
  // In many-to-many, both sides have list=true and no foreign key field
  const inverseField = targetModel.fields.find(
    (f) => f.relationName === field.relationName && f.type === currentModelName
  );

  if (
    field.list &&
    inverseField?.list &&
    !field.relationFrom &&
    !inverseField.relationFrom
  ) {
    // This is a many-to-many relation
    // Use the inverse field name (e.g., "posts" when filtering tags by post)
    return {
      field: inverseField.name,
      operator: 'some',
      value: {
        id:
          typeof parentId === 'string'
            ? Number.parseInt(parentId, 10) || parentId
            : parentId,
      },
      type: 'relation',
    };
  }

  // For one-to-many or many-to-one relations
  const inverseFieldName = inverseField?.relationFrom;

  if (!inverseFieldName) {
    // Fallback to model name in lowercase for backward compatibility
    return {
      field: currentModelName.toLowerCase(),
      operator: 'equals',
      value: {
        id:
          typeof parentId === 'string'
            ? Number.parseInt(parentId, 10) || parentId
            : parentId,
      },
    };
  }

  return {
    field: inverseFieldName,
    operator: 'equals',
    value:
      typeof parentId === 'string'
        ? Number.parseInt(parentId, 10) || parentId
        : parentId,
  };
}
