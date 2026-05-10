import { randomUUID } from 'crypto';
import { ICharacterLibraryV1Dto } from './types';

class CharacterLibraryV1Factory {
  generateOne(params?: { overrides?: Partial<ICharacterLibraryV1Dto> }): ICharacterLibraryV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      character_id: randomUUID(),
      library_id: randomUUID(),
      required_ninja_rank_id: randomUUID(),
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const characterLibraryV1Factory = new CharacterLibraryV1Factory();
