import { IJutsuV1Dto } from './types';

export abstract class JutsuV1DatabaseRepository {
  abstract findById(id: string): Promise<IJutsuV1Dto | null>;
  abstract findByName(name: string): Promise<IJutsuV1Dto | null>;
  abstract findByReleaseId(releaseId: string): Promise<IJutsuV1Dto[]>;
  abstract findByJutsuRankId(jutsuRankId: string): Promise<IJutsuV1Dto[]>;
  abstract findAll(): Promise<IJutsuV1Dto[]>;
  abstract save(dto: IJutsuV1Dto): Promise<IJutsuV1Dto>;
  abstract update(id: string, updates: Partial<Pick<IJutsuV1Dto, 'name' | 'jutsu_rank_id' | 'release_id' | 'components' | 'duration' | 'description' | 'updated_at'>>): Promise<IJutsuV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
