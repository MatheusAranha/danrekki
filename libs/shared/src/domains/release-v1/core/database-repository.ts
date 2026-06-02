import { IKeywordV1Dto } from './types';

export abstract class KeywordV1DatabaseRepository {
  abstract findById(id: string): Promise<IKeywordV1Dto | null>;
  abstract findByName(name: string): Promise<IKeywordV1Dto | null>;
  abstract findAll(): Promise<IKeywordV1Dto[]>;
  abstract save(dto: IKeywordV1Dto): Promise<IKeywordV1Dto>;
  abstract update(id: string, updates: Partial<Pick<IKeywordV1Dto, 'name' | 'updated_at'>>): Promise<IKeywordV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
