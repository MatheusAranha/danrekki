export const characterLibraryV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'character_id', 'library_id', 'required_ninja_rank_id', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    character_id: { type: 'string', minLength: 1 },
    library_id: { type: 'string', minLength: 1 },
    required_ninja_rank_id: { type: 'string', minLength: 1 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};
