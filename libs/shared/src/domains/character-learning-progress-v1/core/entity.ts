import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { characterLearningProgressV1EntityJsonSchema } from './entity.schema';
import { LearningProgressV1AlreadyCompletedError } from './errors';
import { ICharacterLearningProgressV1Dto } from './types';

export class CharacterLearningProgressV1Entity {
  private readonly dto: ICharacterLearningProgressV1Dto;

  constructor({ progressInputData }: { progressInputData: ICharacterLearningProgressV1Dto }) {
    this.dto = progressInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(characterLearningProgressV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ICharacterLearningProgressV1Dto {
    return structuredClone(this.dto);
  }

  investDt(amount: number): CharacterLearningProgressV1Entity {
    if (this.dto.status === 'completed') {
      throw new LearningProgressV1AlreadyCompletedError(
        `Cannot invest DT in already completed learning progress "${this.dto._id}"`,
      );
    }
    const newInvested = this.dto.dt_invested + amount;
    const now = new Date().toISOString();
    const completed = newInvested >= this.dto.dt_required;
    return new CharacterLearningProgressV1Entity({
      progressInputData: {
        ...this.dto,
        dt_invested: newInvested,
        status: completed ? 'completed' : 'in_progress',
        completed_at: completed ? now : this.dto.completed_at,
        updated_at: now,
      },
    });
  }

  isCompleted(): boolean {
    return this.dto.status === 'completed';
  }
}
