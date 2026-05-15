import { RepositorySession } from '../../../_shared/types';
import { ICharacterLearningProgressV1Dto } from './types';

export abstract class CharacterLearningProgressV1DatabaseRepository {
  abstract findById(id: string): Promise<ICharacterLearningProgressV1Dto | null>;
  abstract findByCharacterId(characterId: string): Promise<ICharacterLearningProgressV1Dto[]>;
  abstract findByCharacterAndContent(characterId: string, trainableContentId: string): Promise<ICharacterLearningProgressV1Dto | null>;
  abstract save(dto: ICharacterLearningProgressV1Dto): Promise<ICharacterLearningProgressV1Dto>;
  abstract update(
    id: string,
    updates: Partial<Pick<ICharacterLearningProgressV1Dto, 'dt_invested' | 'status' | 'completed_at' | 'updated_at'>>,
    session?: RepositorySession,
  ): Promise<ICharacterLearningProgressV1Dto | null>;
}
