export const createCharacterV1InputDtoJsonSchema = {
  type: 'object',
  required: ['name', 'user_id', 'clan_id'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    user_id: { type: 'string', minLength: 1 },
    clan_id: { type: 'string', minLength: 1 },
  },
};
