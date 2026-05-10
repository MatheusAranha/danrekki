import { ICharacterReleaseV1Dto } from './types';

export abstract class CharacterReleaseV1DatabaseRepository {
  abstract findById(id: string): Promise<ICharacterReleaseV1Dto | null>;
  abstract findByCharacterId(characterId: string): Promise<ICharacterReleaseV1Dto[]>;
  abstract findByCharacterAndRelease(characterId: string, releaseId: string): Promise<ICharacterReleaseV1Dto | null>;
  abstract save(dto: ICharacterReleaseV1Dto): Promise<ICharacterReleaseV1Dto>;
  abstract delete(id: string): Promise<boolean>;
}
