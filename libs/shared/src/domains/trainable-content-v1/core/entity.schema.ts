export const trainableContentV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'type', 'jutsu_id', 'name', 'description', 'base_dt_cost', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: ['jutsu', 'tool', 'weapon_or_armor', 'skill_proficiency', 'feat'] },
    jutsu_id: { type: ['string', 'null'] },
    name: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', minLength: 1 },
    base_dt_cost: { type: 'number', minimum: 1 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
  if: { properties: { type: { const: 'jutsu' } }, required: ['type'] },
  then: { properties: { jutsu_id: { type: 'string', minLength: 1 } } },
  else: { properties: { jutsu_id: { const: null } } },
};
