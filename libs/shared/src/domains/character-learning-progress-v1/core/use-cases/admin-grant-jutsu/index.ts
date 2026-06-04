import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLearningProgressV1DatabaseRepository } from '../../database-repository';
import { LearningProgressV1AlreadyCompletedError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { TrainableContentV1DatabaseRepository } from '../../../../trainable-content-v1/core/database-repository';
import { TrainableContentV1NotFoundError } from '../../../../trainable-content-v1/core/errors';
import { IAdminGrantJutsuV1UseCaseInputDto, IAdminGrantJutsuV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id', 'trainable_content_id'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    trainable_content_id: { type: 'string', minLength: 1 },
  },
};

export class AdminGrantJutsuV1UseCase {
  constructor(
    private readonly progressRepo: CharacterLearningProgressV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly contentRepo: TrainableContentV1DatabaseRepository,
  ) {}

  async execute(inputDto: IAdminGrantJutsuV1UseCaseInputDto): Promise<IAdminGrantJutsuV1UseCaseOutputDto> {
    const log: ILog = { module: AdminGrantJutsuV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const content = await this.contentRepo.findById(inputDto.trainable_content_id);
      if (!content) throw new TrainableContentV1NotFoundError(`TrainableContent with id "${inputDto.trainable_content_id}" not found`);
      log.steps.push({ message: `TrainableContent ${inputDto.trainable_content_id} found.` });

      const existing = await this.progressRepo.findByCharacterAndContent(
        inputDto.character_id,
        inputDto.trainable_content_id,
      );

      const now = new Date().toISOString();

      if (existing) {
        if (existing.status === 'completed') {
          throw new LearningProgressV1AlreadyCompletedError(
            `Character "${inputDto.character_id}" has already completed learning for content "${inputDto.trainable_content_id}"`,
          );
        }
        // Complete an in-progress session without requiring further DT investment.
        const completed = await this.progressRepo.update(existing._id, {
          status: 'completed',
          completed_at: now,
          updated_at: now,
        });
        log.steps.push({ message: `Completed existing in-progress learning ${existing._id} via admin grant.` });
        logInfo(`Admin granted jutsu by completing in-progress learning: ${existing._id}`, log);
        return completed!;
      }

      // No prior session — create one that is immediately completed.
      // dt_required = 0 and dt_invested = 0 signals admin grant (no DT was spent).
      const progressDto = {
        _id: randomUUID(),
        character_id: inputDto.character_id,
        trainable_content_id: inputDto.trainable_content_id,
        dt_invested: 0,
        dt_required: 0,
        status: 'completed' as const,
        started_at: now,
        completed_at: now,
        updated_at: now,
      };

      const saved = await this.progressRepo.save(progressDto);
      log.steps.push({ message: `Admin-granted learning progress created with id ${saved._id}.` });

      logInfo(`Admin granted jutsu: new completed learning progress ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while admin-granting jutsu.' });
      logError('Error in AdminGrantJutsuV1UseCase', log);
      throw err;
    }
  }
}
