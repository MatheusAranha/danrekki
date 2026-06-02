export const characterKeywordV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'character_id', 'keyword_id', 'created_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    character_id: { type: 'string', minLength: 1 },
    keyword_id: { type: 'string', minLength: 1 },
    created_at: { type: 'string' },
  },
};
