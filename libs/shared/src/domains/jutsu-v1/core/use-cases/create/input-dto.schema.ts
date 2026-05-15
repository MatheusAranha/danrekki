export const createJutsuV1InputDtoJsonSchema = {
  type: 'object',
  required: ['name', 'jutsu_rank_id', 'release_id', 'components', 'duration', 'description'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    jutsu_rank_id: { type: 'string', minLength: 1 },
    release_id: { type: 'string', minLength: 1 },
    elements: { type: 'array', items: { type: 'string', enum: ['katon', 'suiton', 'doton', 'futon', 'raiton', 'iryo'] } },
    components: { type: 'string', minLength: 1 },
    duration: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
  },
};
