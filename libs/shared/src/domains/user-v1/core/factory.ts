import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { IUserV1Dto, UserRole } from './types';

class UserV1Factory {
  generateOne(params?: { overrides?: Partial<IUserV1Dto> }): IUserV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      email: faker.internet.email(),
      password_hash: '$2b$10$fakehashedpassword',
      role: faker.helpers.arrayElement(['admin', 'player'] as UserRole[]),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const userV1Factory = new UserV1Factory();
