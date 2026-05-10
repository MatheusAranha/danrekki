import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { INinjaRankV1Dto } from './types';

class NinjaRankV1Factory {
  generateOne(params?: { overrides?: Partial<INinjaRankV1Dto> }): INinjaRankV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.word.noun(),
      order: faker.number.int({ min: 1, max: 10 }),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const ninjaRankV1Factory = new NinjaRankV1Factory();
