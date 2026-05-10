import { ITrainableContentV1Dto } from './types';

export abstract class TrainableContentV1DatabaseRepository {
  abstract findById(id: string): Promise<ITrainableContentV1Dto | null>;
  abstract findByJutsuId(jutsuId: string): Promise<ITrainableContentV1Dto | null>;
  abstract findAll(): Promise<ITrainableContentV1Dto[]>;
  abstract save(dto: ITrainableContentV1Dto): Promise<ITrainableContentV1Dto>;
  abstract update(id: string, updates: Partial<Pick<ITrainableContentV1Dto, 'name' | 'description' | 'base_dt_cost' | 'updated_at'>>): Promise<ITrainableContentV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
