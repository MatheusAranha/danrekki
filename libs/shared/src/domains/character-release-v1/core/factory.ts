import { randomUUID } from 'crypto';
import { ICharacterReleaseV1Dto } from './types';

class CharacterReleaseV1Factory {
  generateOne(params?: { overrides?: Partial<ICharacterReleaseV1Dto> }): ICharacterReleaseV1Dto {
    return {
      _id: randomUUID(),
      character_id: randomUUID(),
      release_id: randomUUID(),
      created_at: new Date().toISOString(),
      ...params?.overrides,
    };
  }
}

export const characterReleaseV1Factory = new CharacterReleaseV1Factory();
