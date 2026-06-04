export const updateCharacterV1InputDtoJsonSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    clan_id: { type: 'string', minLength: 1 },
    elemental_releases: { type: 'array', items: { type: 'string', enum: ['katon', 'suiton', 'doton', 'futon', 'raiton', 'iryo'] } },
  },
};
