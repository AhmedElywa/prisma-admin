import { getRelationType, type RelationType } from './relation-defaults';
import type { AdminField } from './types';

// Define which display modes are valid for each relation type
const VALID_DISPLAY_MODES: Record<
  RelationType,
  AdminField['relationDisplayMode'][]
> = {
  'one-to-one': ['link', 'dropdown', 'badge', 'inline'],
  'many-to-one': ['link', 'dropdown', 'badge', 'inline'],
  'one-to-many': ['count', 'tags', 'inline'],
  'many-to-many': ['count', 'tags', 'inline'],
};

// Define which actions are valid for each relation type
const VALID_ACTIONS: Record<
  RelationType,
  (keyof NonNullable<AdminField['relationActions']>)[]
> = {
  'one-to-one': ['filter', 'view', 'edit'],
  'many-to-one': ['filter', 'view', 'edit'], // Remove viewAll for many-to-one
  'one-to-many': ['viewAll'],
  'many-to-many': ['filter', 'viewAll'],
};

// Check if a display mode is valid for a relation type
export function isValidDisplayMode(
  relationType: RelationType,
  displayMode: AdminField['relationDisplayMode']
): boolean {
  return VALID_DISPLAY_MODES[relationType].includes(displayMode);
}

// Check if an action is valid for a relation type
export function isValidAction(
  relationType: RelationType,
  action: keyof NonNullable<AdminField['relationActions']>
): boolean {
  return VALID_ACTIONS[relationType].includes(action);
}

// Get valid display modes for a relation type
export function getValidDisplayModes(
  relationType: RelationType
): AdminField['relationDisplayMode'][] {
  return VALID_DISPLAY_MODES[relationType];
}

// Get valid actions for a relation type
export function getValidActions(
  relationType: RelationType
): (keyof NonNullable<AdminField['relationActions']>)[] {
  return VALID_ACTIONS[relationType];
}

// Validate and fix a field's relation configuration
export function validateRelationConfig(field: AdminField): AdminField {
  const relationType = getRelationType(field);
  if (!relationType) {
    return field;
  }

  const validatedField = { ...field };

  // Validate display mode
  if (
    field.relationDisplayMode &&
    !isValidDisplayMode(relationType, field.relationDisplayMode)
  ) {
    // Set to the first valid display mode
    validatedField.relationDisplayMode = VALID_DISPLAY_MODES[relationType][0];
  }

  // Validate actions
  if (field.relationActions) {
    const validActions = getValidActions(relationType);
    const validatedActions: AdminField['relationActions'] = {};

    // Only keep valid actions
    for (const action of validActions) {
      validatedActions[action] = field.relationActions[action] ?? false;
    }

    // Set invalid actions to false
    const allActions: (keyof NonNullable<AdminField['relationActions']>)[] = [
      'filter',
      'view',
      'edit',
      'viewAll',
    ];
    for (const action of allActions) {
      if (!validActions.includes(action)) {
        validatedActions[action] = false;
      }
    }

    validatedField.relationActions = validatedActions;
  }

  return validatedField;
}

// Get help text for display mode based on relation type
export function getDisplayModeHelpText(relationType: RelationType): string {
  switch (relationType) {
    case 'one-to-one':
    case 'many-to-one':
      return 'For single relations, use link, dropdown, badge, or inline display';
    case 'one-to-many':
    case 'many-to-many':
      return 'For list relations, use count, tags, or inline display';
    default:
      return '';
  }
}

// Get help text for actions based on relation type
export function getActionHelpText(
  relationType: RelationType,
  action: keyof NonNullable<AdminField['relationActions']>
): string {
  const isValid = isValidAction(relationType, action);

  if (!isValid) {
    switch (action) {
      case 'view':
      case 'edit':
        return `Not available for ${relationType} relations (multiple records)`;
      case 'filter':
        return relationType === 'one-to-many'
          ? 'Not available for one-to-many relations'
          : '';
      case 'viewAll':
        return relationType === 'one-to-one'
          ? 'Not available for one-to-one relations (single record)'
          : '';
      default:
        return '';
    }
  }

  return '';
}

// Migrate all fields in admin settings to valid configurations
export function migrateRelationConfigs(adminSettings: any): any {
  return {
    ...adminSettings,
    models: adminSettings.models.map((model: any) => ({
      ...model,
      fields: model.fields.map((field: any) => {
        if (field.relationField) {
          return validateRelationConfig(field);
        }
        return field;
      }),
    })),
  };
}
