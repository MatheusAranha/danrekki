export const dtTransactionV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'character_id', 'amount', 'reason', 'created_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    character_id: { type: 'string', minLength: 1 },
    amount: { type: 'number' },
    reason: { type: 'string', minLength: 1 },
    created_at: { type: 'string', format: 'date-time' },
  },
};
