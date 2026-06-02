import { ICharacterKeywordV1Dto } from './types';

export abstract class CharacterKeywordV1DatabaseRepository {
  abstract findById(id: string): Promise<ICharacterKeywordV1Dto | null>;
  abstract findByCharacterId(characterId: string): Promise<ICharacterKeywordV1Dto[]>;
  abstract findByCharacterAndKeyword(characterId: string, releaseId: string): Promise<ICharacterKeywordV1Dto | null>;
  abstract save(dto: ICharacterKeywordV1Dto): Promise<ICharacterKeywordV1Dto>;
  abstract delete(id: string): Promise<boolean>;
}
