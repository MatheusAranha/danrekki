import { ISenseiV1Dto } from './types';

export abstract class SenseiV1DatabaseRepository {
  abstract findById(id: string): Promise<ISenseiV1Dto | null>;
  abstract findByName(name: string): Promise<ISenseiV1Dto | null>;
  abstract findAll(): Promise<ISenseiV1Dto[]>;
  abstract save(dto: ISenseiV1Dto): Promise<ISenseiV1Dto>;
  abstract update(id: string, updates: Partial<Pick<ISenseiV1Dto, 'name' | 'description' | 'updated_at'>>): Promise<ISenseiV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
