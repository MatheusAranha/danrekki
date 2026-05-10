export const libraryV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'name', 'description', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1, maxLength: 200 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
