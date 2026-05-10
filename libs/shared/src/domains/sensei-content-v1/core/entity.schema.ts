export const senseiContentV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'sensei_id', 'trainable_content_id', 'required_proximity', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    sensei_id: { type: 'string', minLength: 1 },
    trainable_content_id: { type: 'string', minLength: 1 },
    required_proximity: { type: 'number', minimum: 1, maximum: 10 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
