import { INinjaRankV1Dto } from './types';

export abstract class NinjaRankV1DatabaseRepository {
  abstract findById(id: string): Promise<INinjaRankV1Dto | null>;
  abstract findByName(name: string): Promise<INinjaRankV1Dto | null>;
  abstract findAll(): Promise<INinjaRankV1Dto[]>;
  abstract save(dto: INinjaRankV1Dto): Promise<INinjaRankV1Dto>;
  abstract update(id: string, updates: Partial<Pick<INinjaRankV1Dto, 'name' | 'order' | 'updated_at'>>): Promise<INinjaRankV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
