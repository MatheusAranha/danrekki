export const senseiV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'name', 'description', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
