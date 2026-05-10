export const createJutsuRankV1InputDtoJsonSchema = {
  type: 'object',
  required: ['name', 'order', 'dt_cost'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    order: { type: 'number', minimum: 1 },
    dt_cost: { type: 'number', minimum: 1 },
  },
};
