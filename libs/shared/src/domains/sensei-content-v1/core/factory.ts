import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { ISenseiContentV1Dto } from './types';

class SenseiContentV1Factory {
  generateOne(params?: { overrides?: Partial<ISenseiContentV1Dto> }): ISenseiContentV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      sensei_id: randomUUID(),
      trainable_content_id: randomUUID(),
      required_proximity: faker.number.int({ min: 1, max: 10 }),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const senseiContentV1Factory = new SenseiContentV1Factory();
