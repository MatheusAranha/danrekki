export const addDtTransactionV1InputDtoJsonSchema = {
  type: 'object',
  required: ['character_id', 'amount', 'reason'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    amount: { type: 'number' },
    reason: { type: 'string', minLength: 1 },
  },
};
