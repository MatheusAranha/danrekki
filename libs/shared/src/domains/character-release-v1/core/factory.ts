import { randomUUID } from 'crypto';
import { ICharacterKeywordV1Dto } from './types';

class CharacterReleaseV1Factory {
  generateOne(params?: { overrides?: Partial<ICharacterKeywordV1Dto> }): ICharacterKeywordV1Dto {
    return {
      _id: randomUUID(),
      character_id: randomUUID(),
      keyword_id: randomUUID(),
      created_at: new Date().toISOString(),
      ...params?.overrides,
    };
  }
}

export const characterReleaseV1Factory = new CharacterReleaseV1Factory();
