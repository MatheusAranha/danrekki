export const jutsuV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'name', 'jutsu_rank_id', 'release_id', 'components', 'duration', 'description', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    jutsu_rank_id: { type: 'string', minLength: 1 },
    release_id: { type: 'string', minLength: 1 },
    components: { type: 'string', minLength: 1 },
    duration: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
