import { ICharacterV1Dto } from './types';

export abstract class CharacterV1DatabaseRepository {
  abstract findById(id: string): Promise<ICharacterV1Dto | null>;
  abstract findByUserId(userId: string): Promise<ICharacterV1Dto[]>;
  abstract findAll(): Promise<ICharacterV1Dto[]>;
  abstract save(dto: ICharacterV1Dto): Promise<ICharacterV1Dto>;
  abstract update(id: string, updates: Partial<Pick<ICharacterV1Dto, 'name' | 'clan_id' | 'available_dt' | 'updated_at'>>): Promise<ICharacterV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
