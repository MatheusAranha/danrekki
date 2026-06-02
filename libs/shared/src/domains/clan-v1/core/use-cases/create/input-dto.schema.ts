export const createClanV1InputDtoJsonSchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    dt_modifiers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['keyword_id', 'multiplier'],
        additionalProperties: false,
        properties: {
          keyword_id: { type: 'string', minLength: 1 },
          multiplier: { type: 'number', exclusiveMinimum: 0, maximum: 1 },
        },
      },
    },
  },
};
