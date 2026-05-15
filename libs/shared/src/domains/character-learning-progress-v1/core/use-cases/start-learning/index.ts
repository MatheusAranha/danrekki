import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLearningProgressV1DatabaseRepository } from '../../database-repository';
import { CharacterLearningProgressV1Entity } from '../../entity';
import { LearningProgressV1AlreadyExistsError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { TrainableContentV1DatabaseRepository } from '../../../../trainable-content-v1/core/database-repository';
import { TrainableContentV1NotFoundError } from '../../../../trainable-content-v1/core/errors';
import { ClanV1DatabaseRepository } from '../../../../clan-v1/core/database-repository';
import { CharacterReleaseV1DatabaseRepository } from '../../../../character-release-v1/core/database-repository';
import { calculateDtCost } from '../../services/calculate-dt-cost';
import { IStartLearningV1UseCaseInputDto, IStartLearningV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id', 'trainable_content_id'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    trainable_content_id: { type: 'string', minLength: 1 },
  },
};

export class StartLearningV1UseCase {
  constructor(
    private readonly progressRepo: CharacterLearningProgressV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly contentRepo: TrainableContentV1DatabaseRepository,
    private readonly clanRepo: ClanV1DatabaseRepository,
    private readonly characterReleaseRepo: CharacterReleaseV1DatabaseRepository,
  ) {}

  async execute(inputDto: IStartLearningV1UseCaseInputDto): Promise<IStartLearningV1UseCaseOutputDto> {
    const log: ILog = { module: StartLearningV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const content = await this.contentRepo.findById(inputDto.trainable_content_id);
      if (!content) throw new TrainableContentV1NotFoundError(`TrainableContent with id "${inputDto.trainable_content_id}" not found`);
      log.steps.push({ message: `TrainableContent ${inputDto.trainable_content_id} found.` });

      const existing = await this.progressRepo.findByCharacterAndContent(inputDto.character_id, inputDto.trainable_content_id);
      if (existing && existing.status === 'in_progress') {
        throw new LearningProgressV1AlreadyExistsError(
          `Character "${inputDto.character_id}" already has in-progress learning for content "${inputDto.trainable_content_id}"`,
        );
      }
      log.steps.push({ message: 'Verified no active learning progress exists.' });

      const clan = character.clan_id ? await this.clanRepo.findById(character.clan_id) : null;
      log.steps.push({ message: clan ? `Clan ${character.clan_id} found.` : 'No clan found, using empty modifiers.' });

      const characterReleases = await this.characterReleaseRepo.findByCharacterId(inputDto.character_id);
      const releaseIds = characterReleases.map((r) => r.release_id);
      log.steps.push({ message: `Retrieved ${releaseIds.length} release(s) for character ${inputDto.character_id}.` });

      const dtRequired = calculateDtCost(content.base_dt_cost, clan?.dt_modifiers ?? [], releaseIds);
      log.steps.push({ message: `Calculated dt_required: ${dtRequired}.` });

      const now = new Date().toISOString();
      const progressDto = new CharacterLearningProgressV1Entity({
        progressInputData: {
          _id: randomUUID(),
          character_id: inputDto.character_id,
          trainable_content_id: inputDto.trainable_content_id,
          dt_invested: 0,
          dt_required: dtRequired,
          status: 'in_progress',
          started_at: now,
          completed_at: null,
          updated_at: now,
        },
      })
        .validate()
        .getDto();
      log.steps.push({ message: 'Built and validated CharacterLearningProgressV1Entity.' });

      const saved = await this.progressRepo.save(progressDto);
      log.steps.push({ message: `LearningProgress persisted with id ${saved._id}.` });

      logInfo(`LearningProgress started: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while starting LearningProgressV1.' });
      logError('Error starting LearningProgressV1', log);
      throw err;
    }
  }
}
