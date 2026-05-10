import { randomUUID } from 'crypto';
import { ILibraryScrollV1Dto } from './types';

class LibraryScrollV1Factory {
  generateOne(params?: { overrides?: Partial<Pick<ILibraryScrollV1Dto, 'rented_by_character_id' | 'rented_at'>> & Partial<ILibraryScrollV1Dto> }): ILibraryScrollV1Dto {
    const now = new Date().toISOString();
    return {
      _id: randomUUID(),
      library_id: randomUUID(),
      jutsu_id: randomUUID(),
      required_ninja_rank_id: randomUUID(),
      rented_by_character_id: null,
      rented_at: null,
      created_at: now,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const libraryScrollV1Factory = new LibraryScrollV1Factory();
