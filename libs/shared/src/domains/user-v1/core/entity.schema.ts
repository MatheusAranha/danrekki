export const userV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'email', 'password_hash', 'role', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email', minLength: 1 },
    password_hash: { type: 'string', minLength: 1 },
    role: { type: 'string', enum: ['admin', 'player'] },
    created_at: { type: 'string', minLength: 1 },
    updated_at: { type: 'string', minLength: 1 },
  },
};
