import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { ISenseiV1Dto } from './types';

class SenseiV1Factory {
  generateOne(params?: { overrides?: Partial<ISenseiV1Dto> }): ISenseiV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.person.fullName(),
      description: faker.lorem.sentence(),
      picture_url: null,
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const senseiV1Factory = new SenseiV1Factory();
