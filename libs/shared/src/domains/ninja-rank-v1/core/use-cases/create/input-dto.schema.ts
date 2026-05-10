export const createNinjaRankV1InputDtoJsonSchema = {
  type: 'object',
  required: ['name', 'order'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    order: { type: 'number', minimum: 1 },
  },
};
