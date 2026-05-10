export const createLibraryV1InputDtoJsonSchema = {
  type: 'object',
  required: ['name', 'description'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1, maxLength: 200 },
  },
};
