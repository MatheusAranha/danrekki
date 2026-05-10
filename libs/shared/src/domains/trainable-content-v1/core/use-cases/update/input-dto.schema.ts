export const updateTrainableContentV1InputDtoJsonSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', minLength: 1 },
    base_dt_cost: { type: 'number', minimum: 1 },
  },
};
