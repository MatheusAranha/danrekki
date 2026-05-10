import { ISenseiContentV1Dto } from './types';

export abstract class SenseiContentV1DatabaseRepository {
  abstract findById(id: string): Promise<ISenseiContentV1Dto | null>;
  abstract findBySenseiId(senseiId: string): Promise<ISenseiContentV1Dto[]>;
  abstract findBySenseiAndContent(senseiId: string, trainableContentId: string): Promise<ISenseiContentV1Dto | null>;
  abstract save(dto: ISenseiContentV1Dto): Promise<ISenseiContentV1Dto>;
  abstract update(id: string, updates: Partial<Pick<ISenseiContentV1Dto, 'required_proximity' | 'updated_at'>>): Promise<ISenseiContentV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
