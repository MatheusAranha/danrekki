import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { ILibraryV1Dto } from './types';

class LibraryV1Factory {
  generateOne(params?: { overrides?: Partial<ILibraryV1Dto> }): ILibraryV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const libraryV1Factory = new LibraryV1Factory();
