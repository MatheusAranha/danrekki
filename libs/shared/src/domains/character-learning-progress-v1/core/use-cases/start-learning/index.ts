import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLearningProgressV1DatabaseRepository } from '../../database-repository';
import { CharacterLearningProgressV1Entity } from '../../entity';
import { LearningProgressV1AlreadyExistsError, TrainingAccessDeniedError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { TrainableContentV1DatabaseRepository } from '../../../../trainable-content-v1/core/database-repository';
import { TrainableContentV1NotFoundError } from '../../../../trainable-content-v1/core/errors';
import { JutsuV1DatabaseRepository } from '../../../../jutsu-v1/core/database-repository';
import { JutsuElement } from '../../../../jutsu-v1/core/types';
import { ClanV1DatabaseRepository } from '../../../../clan-v1/core/database-repository';
import { CharacterKeywordV1DatabaseRepository } from '../../../../character-release-v1/core/database-repository';
import { CharacterLibraryV1DatabaseRepository } from '../../../../character-library-v1/core/database-repository';
import { LibraryScrollV1DatabaseRepository } from '../../../../library-scroll-v1/core/database-repository';
import { CharacterSenseiV1DatabaseRepository } from '../../../../character-sensei-v1/core/database-repository';
import { SenseiContentV1DatabaseRepository } from '../../../../sensei-content-v1/core/database-repository';
import { calculateDtCost } from '../../services/calculate-dt-cost';
import { IStartLearningV1UseCaseInputDto, IStartLearningV1UseCaseOutputDto } from './types';

// DT multipliers: each DT you invest "counts for" more progress when learning with a better source.
const SOURCE_DT_DIVISOR: Record<'sensei' | 'library', number> = {
  sensei: 2,    // learn twice as fast with a sensei
  library: 1.5, // learn 1.5× faster via scroll vs. raw
};

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
    private readonly characterKeywordRepo: CharacterKeywordV1DatabaseRepository,
    private readonly characterLibraryRepo: CharacterLibraryV1DatabaseRepository,
    private readonly libraryScrollRepo: LibraryScrollV1DatabaseRepository,
    private readonly characterSenseiRepo: CharacterSenseiV1DatabaseRepository,
    private readonly senseiContentRepo: SenseiContentV1DatabaseRepository,
    private readonly jutsuRepo: JutsuV1DatabaseRepository,
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

      // Check elemental eligibility for jutsu content.
      if (content.type === 'jutsu' && content.jutsu_id) {
        const jutsu = await this.jutsuRepo.findById(content.jutsu_id);
        if (jutsu && jutsu.elements.length > 0) {
          const affinities = new Set<JutsuElement>(character.elemental_releases);
          const eligible = jutsu.elements.some((el) => affinities.has(el));
          if (!eligible) {
            throw new TrainingAccessDeniedError(
              `Character "${inputDto.character_id}" does not have the required elemental release to learn "${jutsu.name}"`,
            );
          }
          log.steps.push({ message: 'Elemental eligibility confirmed.' });
        }
      }

      const source = await this.checkAccess(inputDto.character_id, content._id, content.jutsu_id, log);

      const clan = character.clan_id ? await this.clanRepo.findById(character.clan_id) : null;
      log.steps.push({ message: clan ? `Clan ${character.clan_id} found.` : 'No clan found, using empty modifiers.' });

      const characterKeywords = await this.characterKeywordRepo.findByCharacterId(inputDto.character_id);
      const keywordIds = characterKeywords.map((r) => r.keyword_id);
      log.steps.push({ message: `Retrieved ${keywordIds.length} keyword(s) for character ${inputDto.character_id}.` });

      const baseCost = calculateDtCost(content.base_dt_cost, clan?.dt_modifiers ?? [], keywordIds);
      const dtRequired = Math.ceil(baseCost / SOURCE_DT_DIVISOR[source]);
      log.steps.push({ message: `Calculated dt_required: ${dtRequired} (source: ${source}, divisor: ${SOURCE_DT_DIVISOR[source]}).` });

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

  private async checkAccess(
    characterId: string,
    contentId: string,
    jutsuId: string | null,
    log: ILog,
  ): Promise<'sensei' | 'library'> {
    const charSenseis = await this.characterSenseiRepo.findByCharacterId(characterId);
    for (const charSensei of charSenseis) {
      const sc = await this.senseiContentRepo.findBySenseiAndContent(charSensei.sensei_id, contentId);
      if (sc && charSensei.proximity >= sc.required_proximity) {
        log.steps.push({ message: 'Access granted via sensei.' });
        return 'sensei';
      }
    }

    if (jutsuId) {
      const charLibraries = await this.characterLibraryRepo.findByCharacterId(characterId);
      for (const charLib of charLibraries) {
        const scrolls = await this.libraryScrollRepo.findByLibraryId(charLib.library_id);
        if (scrolls.some((s) => s.jutsu_id === jutsuId)) {
          log.steps.push({ message: 'Access granted via library scroll.' });
          return 'library';
        }
      }
    }

    throw new TrainingAccessDeniedError(
      `Character "${characterId}" does not have access to trainable content "${contentId}"`,
    );
  }
}
