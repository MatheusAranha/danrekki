export const createUserV1InputDtoJsonSchema = {
  type: 'object',
  required: ['email', 'password', 'role'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', minLength: 1 },
    password: { type: 'string', minLength: 8 },
    role: { type: 'string', enum: ['admin', 'player'] },
  },
};
