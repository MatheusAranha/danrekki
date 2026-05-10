export const jutsuRankV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'name', 'order', 'dt_cost', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    order: { type: 'number', minimum: 1 },
    dt_cost: { type: 'number', minimum: 1 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
