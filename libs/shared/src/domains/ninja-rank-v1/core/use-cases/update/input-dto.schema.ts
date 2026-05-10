export const updateNinjaRankV1InputDtoJsonSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    order: { type: 'number', minimum: 1 },
  },
};
