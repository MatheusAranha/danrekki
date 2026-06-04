export const characterV1EntityJsonSchema = {
  type: 'object',
  required: ['_id', 'name', 'user_id', 'clan_id', 'available_dt', 'elemental_releases', 'created_at', 'updated_at'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    user_id: { type: 'string', minLength: 1 },
    clan_id: { type: 'string', minLength: 1 },
    available_dt: { type: 'number', minimum: 0 },
    elemental_releases: { type: 'array', items: { type: 'string', enum: ['katon', 'suiton', 'doton', 'futon', 'raiton', 'iryo'] }, default: [] },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};
