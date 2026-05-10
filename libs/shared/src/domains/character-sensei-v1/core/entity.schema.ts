export const characterSenseiV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'character_id', 'sensei_id', 'proximity', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    character_id: { type: 'string', minLength: 1 },
    sensei_id: { type: 'string', minLength: 1 },
    proximity: { type: 'number', minimum: 1, maximum: 10 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};
