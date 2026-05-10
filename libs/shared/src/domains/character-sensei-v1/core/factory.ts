import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { ICharacterSenseiV1Dto } from './types';

class CharacterSenseiV1Factory {
  generateOne(params?: { overrides?: Partial<ICharacterSenseiV1Dto> }): ICharacterSenseiV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      character_id: randomUUID(),
      sensei_id: randomUUID(),
      proximity: faker.number.int({ min: 1, max: 10 }),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const characterSenseiV1Factory = new CharacterSenseiV1Factory();
