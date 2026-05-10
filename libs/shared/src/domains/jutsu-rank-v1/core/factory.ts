import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { IJutsuRankV1Dto } from './types';

class JutsuRankV1Factory {
  generateOne(params?: { overrides?: Partial<IJutsuRankV1Dto> }): IJutsuRankV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.word.noun(),
      order: faker.number.int({ min: 1, max: 10 }),
      dt_cost: faker.helpers.arrayElement([8, 16, 32, 64, 128, 256]),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const jutsuRankV1Factory = new JutsuRankV1Factory();
