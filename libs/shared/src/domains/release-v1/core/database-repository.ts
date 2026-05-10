import { IReleaseV1Dto } from './types';

export abstract class ReleaseV1DatabaseRepository {
  abstract findById(id: string): Promise<IReleaseV1Dto | null>;
  abstract findByName(name: string): Promise<IReleaseV1Dto | null>;
  abstract findAll(): Promise<IReleaseV1Dto[]>;
  abstract save(dto: IReleaseV1Dto): Promise<IReleaseV1Dto>;
  abstract update(id: string, updates: Partial<Pick<IReleaseV1Dto, 'name' | 'updated_at'>>): Promise<IReleaseV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
