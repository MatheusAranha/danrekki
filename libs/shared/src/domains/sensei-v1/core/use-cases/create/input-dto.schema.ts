export const createSenseiV1InputDtoJsonSchema = {
  type: 'object',
  required: ['name', 'description'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    picture_url: { type: ['string', 'null'] },
  },
};
