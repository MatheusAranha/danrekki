export const characterReleaseV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'character_id', 'release_id', 'created_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    character_id: { type: 'string', minLength: 1 },
    release_id: { type: 'string', minLength: 1 },
    created_at: { type: 'string' },
  },
};
