import { ICharacterSenseiV1Dto } from './types';

export abstract class CharacterSenseiV1DatabaseRepository {
  abstract findById(id: string): Promise<ICharacterSenseiV1Dto | null>;
  abstract findByCharacterId(characterId: string): Promise<ICharacterSenseiV1Dto[]>;
  abstract findByCharacterAndSensei(characterId: string, senseiId: string): Promise<ICharacterSenseiV1Dto | null>;
  abstract save(dto: ICharacterSenseiV1Dto): Promise<ICharacterSenseiV1Dto>;
  abstract delete(id: string): Promise<boolean>;
}
