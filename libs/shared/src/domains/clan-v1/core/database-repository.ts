import { IClanV1Dto } from './types';

export abstract class ClanV1DatabaseRepository {
  abstract findById(id: string): Promise<IClanV1Dto | null>;
  abstract findByName(name: string): Promise<IClanV1Dto | null>;
  abstract findAll(): Promise<IClanV1Dto[]>;
  abstract save(dto: IClanV1Dto): Promise<IClanV1Dto>;
  abstract update(id: string, updates: Partial<Pick<IClanV1Dto, 'name' | 'dt_modifiers' | 'updated_at'>>): Promise<IClanV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
