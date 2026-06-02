export const clanV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'name', 'dt_modifiers', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    dt_modifiers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['keyword_id', 'multiplier'],
        additionalProperties: false,
        properties: {
          keyword_id: { type: 'string', minLength: 1 },
          multiplier: { type: 'number', exclusiveMinimum: 0, maximum: 1 },
        },
      },
    },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
