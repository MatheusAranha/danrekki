import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { ICharacterV1Dto } from './types';

class CharacterV1Factory {
  generateOne(params?: { overrides?: Partial<ICharacterV1Dto> }): ICharacterV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      name: faker.person.firstName(),
      user_id: randomUUID(),
      clan_id: randomUUID(),
      available_dt: 0,
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const characterV1Factory = new CharacterV1Factory();
