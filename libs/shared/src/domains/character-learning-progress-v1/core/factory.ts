import { randomUUID } from 'crypto';
import { ICharacterLearningProgressV1Dto, LearningProgressV1Status } from './types';

class CharacterLearningProgressV1Factory {
  generateOne(params?: { overrides?: Partial<ICharacterLearningProgressV1Dto> }): ICharacterLearningProgressV1Dto {
    const now = new Date().toISOString();
    const dtRequired = 100;
    return {
      _id: randomUUID(),
      character_id: randomUUID(),
      trainable_content_id: randomUUID(),
      dt_invested: 0,
      dt_required: dtRequired,
      status: 'in_progress' as LearningProgressV1Status,
      started_at: now,
      completed_at: null,
      updated_at: now,
      ...params?.overrides,
    };
  }
}

export const characterLearningProgressV1Factory = new CharacterLearningProgressV1Factory();
