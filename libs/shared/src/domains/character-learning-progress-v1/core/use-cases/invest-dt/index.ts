import { randomUUID } from 'crypto';
import { ILog, SessionFactory } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLearningProgressV1DatabaseRepository } from '../../database-repository';
import { CharacterLearningProgressV1Entity } from '../../entity';
import { InsufficientDtError, LearningProgressV1AlreadyCompletedError, LearningProgressV1NotFoundError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { DtTransactionV1DatabaseRepository } from '../../../../dt-transaction-v1/core/database-repository';
import { IInvestDtV1UseCaseInputDto, IInvestDtV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['progress_id', 'amount'],
  additionalProperties: false,
  properties: {
    progress_id: { type: 'string', minLength: 1 },
    amount: { type: 'number', exclusiveMinimum: 0 },
  },
};

export class InvestDtV1UseCase {
  constructor(
    private readonly progressRepo: CharacterLearningProgressV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly dtTransactionRepo: DtTransactionV1DatabaseRepository,
    private readonly sessionFactory: SessionFactory,
  ) {}

  async execute(inputDto: IInvestDtV1UseCaseInputDto): Promise<IInvestDtV1UseCaseOutputDto> {
    const log: ILog = { module: InvestDtV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const progress = await this.progressRepo.findById(inputDto.progress_id);
      if (!progress) throw new LearningProgressV1NotFoundError(`LearningProgress with id "${inputDto.progress_id}" not found`);
      log.steps.push({ message: `LearningProgress ${inputDto.progress_id} found.` });

      if (progress.status === 'completed') {
        throw new LearningProgressV1AlreadyCompletedError(
          `LearningProgress "${inputDto.progress_id}" is already completed`,
        );
      }

      const character = await this.characterRepo.findById(progress.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${progress.character_id}" not found`);
      log.steps.push({ message: `Character ${progress.character_id} found.` });

      // Cap amount to whatever is still needed to complete — no over-investing.
      const remaining = progress.dt_required - progress.dt_invested;
      const amount = Math.min(inputDto.amount, remaining);

      if (character.available_dt < amount) {
        throw new InsufficientDtError(
          `Character "${progress.character_id}" has insufficient DT: available ${character.available_dt}, required ${amount}`,
        );
      }
      log.steps.push({ message: `Character has sufficient DT: ${character.available_dt}.` });

      const updatedProgress = new CharacterLearningProgressV1Entity({ progressInputData: progress })
        .investDt(amount)
        .getDto();
      log.steps.push({ message: 'Computed updated learning progress via investDt.' });

      const now = new Date().toISOString();
      const transactionDto = {
        _id: randomUUID(),
        character_id: progress.character_id,
        amount: -amount,
        reason: 'DT invested in learning',
        created_at: now,
      };

      const session = await this.sessionFactory();
      try {
        await session.withTransaction(async () => {
          await this.characterRepo.update(
            character._id,
            {
              available_dt: character.available_dt - amount,
              updated_at: now,
            },
            session,
          );
          await this.dtTransactionRepo.save(transactionDto, session);
          await this.progressRepo.update(
            progress._id,
            {
              dt_invested: updatedProgress.dt_invested,
              status: updatedProgress.status,
              completed_at: updatedProgress.completed_at,
              updated_at: updatedProgress.updated_at,
            },
            session,
          );
        });
      } finally {
        await session.endSession();
      }
      log.steps.push({ message: `DT invested atomically: ${amount} DT for progress ${progress._id}.` });

      logInfo(`DT invested in learning progress: ${progress._id}`, log);
      return updatedProgress;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while investing DT in LearningProgressV1.' });
      logError('Error investing DT in LearningProgressV1', log);
      throw err;
    }
  }
}
