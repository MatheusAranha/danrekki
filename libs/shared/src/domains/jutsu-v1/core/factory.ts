import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { IJutsuV1Dto } from './types';

class JutsuV1Factory {
  generateOne(params?: { overrides?: Partial<IJutsuV1Dto> }): IJutsuV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.word.noun(),
      jutsu_rank_id: randomUUID(),
      release_id: randomUUID(),
      elements: [],
      components: faker.lorem.words(3),
      duration: faker.lorem.word(),
      description: faker.lorem.sentence(),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const jutsuV1Factory = new JutsuV1Factory();
