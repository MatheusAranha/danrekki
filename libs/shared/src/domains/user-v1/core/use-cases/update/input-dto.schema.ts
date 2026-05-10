export const updateUserV1InputDtoJsonSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email', minLength: 1 },
    role: { type: 'string', enum: ['admin', 'player'] },
  },
};
