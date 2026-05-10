import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { IReleaseV1Dto } from './types';

class ReleaseV1Factory {
  generateOne(params?: { overrides?: Partial<IReleaseV1Dto> }): IReleaseV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.word.adjective(),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const releaseV1Factory = new ReleaseV1Factory();
