export const createTrainableContentV1InputDtoJsonSchema = {
  type: 'object',
  required: ['type', 'name', 'description', 'base_dt_cost'],
  additionalProperties: false,
  properties: {
    type: { type: 'string', enum: ['jutsu', 'tool', 'weapon_or_armor', 'skill_proficiency', 'feat'] },
    jutsu_id: { type: ['string', 'null'] },
    name: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', minLength: 1 },
    base_dt_cost: { type: 'number', minimum: 1 },
  },
  if: { properties: { type: { const: 'jutsu' } }, required: ['type'] },
  then: { required: ['jutsu_id'], properties: { jutsu_id: { type: 'string', minLength: 1 } } },
  else: { properties: { jutsu_id: { type: ['string', 'null'] } } },
};
