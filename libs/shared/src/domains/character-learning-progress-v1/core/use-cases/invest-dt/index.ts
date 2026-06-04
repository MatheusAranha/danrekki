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

const SOURCE_MULTIPLIER: Record<string, number> = { solo: 1, library: 1.5, sensei: 2 };

const inputSchema = {
  type: 'object',
  required: ['progress_id', 'amount', 'source'],
  additionalProperties: false,
  properties: {
    progress_id: { type: 'string', minLength: 1 },
    amount: { type: 'number', exclusiveMinimum: 0 },
    source: { type: 'string', enum: ['solo', 'library', 'sensei'] },
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

      const multiplier = SOURCE_MULTIPLIER[inputDto.source] ?? 1;
      const effectiveRemaining = progress.dt_required - progress.dt_invested;

      // Cap raw DT so effective progress doesn't overshoot dt_required.
      const maxRaw = Math.ceil(effectiveRemaining / multiplier);
      const rawAmount = Math.min(inputDto.amount, maxRaw);
      const effectiveAmount = Math.min(Math.ceil(rawAmount * multiplier), effectiveRemaining);

      if (character.available_dt < rawAmount) {
        throw new InsufficientDtError(
          `Character "${progress.character_id}" has insufficient DT: available ${character.available_dt}, required ${rawAmount}`,
        );
      }
      log.steps.push({ message: `Investing ${rawAmount} raw DT (${inputDto.source} ×${multiplier}) = ${effectiveAmount} effective DT.` });

      // Entity tracks effective DT toward dt_required.
      const updatedProgress = new CharacterLearningProgressV1Entity({ progressInputData: progress })
        .investDt(effectiveAmount)
        .getDto();
      log.steps.push({ message: 'Computed updated learning progress via investDt.' });

      const now = new Date().toISOString();
      const transactionDto = {
        _id: randomUUID(),
        character_id: progress.character_id,
        amount: -rawAmount,
        reason: `DT invested in learning (${inputDto.source})`,
        created_at: now,
      };

      const session = await this.sessionFactory();
      try {
        await session.withTransaction(async () => {
          await this.characterRepo.update(
            character._id,
            { available_dt: character.available_dt - rawAmount, updated_at: now },
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
      log.steps.push({ message: `Atomically invested ${rawAmount} DT (${effectiveAmount} effective) for progress ${progress._id}.` });

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
