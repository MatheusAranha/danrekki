import { ICharacterLibraryV1Dto } from './types';

export abstract class CharacterLibraryV1DatabaseRepository {
  abstract findById(id: string): Promise<ICharacterLibraryV1Dto | null>;
  abstract findByCharacterId(characterId: string): Promise<ICharacterLibraryV1Dto[]>;
  abstract findByCharacterAndLibrary(characterId: string, libraryId: string): Promise<ICharacterLibraryV1Dto | null>;
  abstract save(dto: ICharacterLibraryV1Dto): Promise<ICharacterLibraryV1Dto>;
  abstract delete(id: string): Promise<boolean>;
}
