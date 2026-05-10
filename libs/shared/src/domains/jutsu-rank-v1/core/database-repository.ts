import { IJutsuRankV1Dto } from './types';

export abstract class JutsuRankV1DatabaseRepository {
  abstract findById(id: string): Promise<IJutsuRankV1Dto | null>;
  abstract findByName(name: string): Promise<IJutsuRankV1Dto | null>;
  abstract findByOrder(order: number): Promise<IJutsuRankV1Dto | null>;
  abstract findAll(): Promise<IJutsuRankV1Dto[]>;
  abstract save(dto: IJutsuRankV1Dto): Promise<IJutsuRankV1Dto>;
  abstract update(id: string, updates: Partial<Pick<IJutsuRankV1Dto, 'name' | 'order' | 'dt_cost' | 'updated_at'>>): Promise<IJutsuRankV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
