export const updateJutsuV1InputDtoJsonSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    jutsu_rank_id: { type: 'string', minLength: 1 },
    release_id: { type: 'string', minLength: 1 },
    components: { type: 'string', minLength: 1 },
    duration: { type: 'string', minLength: 1 },
    elements: { type: 'array', items: { type: 'string', enum: ['katon', 'suiton', 'doton', 'futon', 'raiton', 'iryo'] } },
    description: { type: 'string', minLength: 1 },
  },
};
