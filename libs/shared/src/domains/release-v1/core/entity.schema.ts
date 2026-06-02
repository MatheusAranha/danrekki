export const keywordV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'name', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
