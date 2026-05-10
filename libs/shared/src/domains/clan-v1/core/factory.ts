import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { IClanV1Dto } from './types';

class ClanV1Factory {
  generateOne(params?: { overrides?: Partial<IClanV1Dto> }): IClanV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.word.noun(),
      dt_modifiers: [],
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const clanV1Factory = new ClanV1Factory();
