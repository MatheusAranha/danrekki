import { RepositorySession } from '../../../_shared/types';
import { IDtTransactionV1Dto } from './types';

export abstract class DtTransactionV1DatabaseRepository {
  abstract findById(id: string): Promise<IDtTransactionV1Dto | null>;
  abstract findByCharacterId(characterId: string): Promise<IDtTransactionV1Dto[]>;
  abstract save(dto: IDtTransactionV1Dto, session?: RepositorySession): Promise<IDtTransactionV1Dto>;
}
