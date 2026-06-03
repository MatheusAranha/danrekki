export const updateJutsuV1InputDtoJsonSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    jutsu_rank_id: { type: 'string', minLength: 1 },
    keyword_ids: { type: 'array', items: { type: 'string', minLength: 1 }, default: [] },
    elements: { type: 'array', items: { type: 'string', enum: ['katon', 'suiton', 'doton', 'futon', 'raiton'] } },
    casting_time: { type: 'string', minLength: 1 },
    range: { type: 'string', minLength: 1 },
    chakra_cost: { type: 'string', minLength: 1 },
    components: { type: 'string', minLength: 1 },
    duration: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    at_higher_ranks: { type: ['string', 'null'] },
  },
};
