export const libraryScrollV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'library_id', 'jutsu_id', 'required_ninja_rank_id', 'rented_by_character_id', 'rented_at', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    library_id: { type: 'string', minLength: 1 },
    jutsu_id: { type: 'string', minLength: 1 },
    required_ninja_rank_id: { type: 'string', minLength: 1 },
    rented_by_character_id: { type: ['string', 'null'], minLength: 1 },
    rented_at: { type: ['string', 'null'], minLength: 1 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
