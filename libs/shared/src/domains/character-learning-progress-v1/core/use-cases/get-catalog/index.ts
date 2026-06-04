import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLearningProgressV1DatabaseRepository } from '../../database-repository';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { CharacterLibraryV1DatabaseRepository } from '../../../../character-library-v1/core/database-repository';
import { LibraryScrollV1DatabaseRepository } from '../../../../library-scroll-v1/core/database-repository';
import { CharacterSenseiV1DatabaseRepository } from '../../../../character-sensei-v1/core/database-repository';
import { SenseiContentV1DatabaseRepository } from '../../../../sensei-content-v1/core/database-repository';
import { TrainableContentV1DatabaseRepository } from '../../../../trainable-content-v1/core/database-repository';
import { JutsuV1DatabaseRepository } from '../../../../jutsu-v1/core/database-repository';
import { ClanV1DatabaseRepository } from '../../../../clan-v1/core/database-repository';
import { CharacterKeywordV1DatabaseRepository } from '../../../../character-release-v1/core/database-repository';
import { calculateDtCost } from '../../services/calculate-dt-cost';
import { JutsuElement } from '../../../../jutsu-v1/core/types';
import { IJutsuV1Dto } from '../../../../jutsu-v1/core/types';
import { ICharacterLearningProgressV1Dto } from '../../types';
import {
  ICatalogEntryV1Dto,
  IGetTrainingCatalogV1UseCaseInputDto,
  IGetTrainingCatalogV1UseCaseOutputDto,
} from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    include_ineligible: { type: 'boolean' },
  },
};

export class GetTrainingCatalogV1UseCase {
  constructor(
    private readonly progressRepo: CharacterLearningProgressV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly characterLibraryRepo: CharacterLibraryV1DatabaseRepository,
    private readonly libraryScrollRepo: LibraryScrollV1DatabaseRepository,
    private readonly characterSenseiRepo: CharacterSenseiV1DatabaseRepository,
    private readonly senseiContentRepo: SenseiContentV1DatabaseRepository,
    private readonly contentRepo: TrainableContentV1DatabaseRepository,
    private readonly jutsuRepo: JutsuV1DatabaseRepository,
    private readonly clanRepo: ClanV1DatabaseRepository,
    private readonly characterKeywordRepo: CharacterKeywordV1DatabaseRepository,
  ) {}

  async execute(inputDto: IGetTrainingCatalogV1UseCaseInputDto): Promise<IGetTrainingCatalogV1UseCaseOutputDto> {
    const log: ILog = { module: GetTrainingCatalogV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const includeIneligible = inputDto.include_ineligible ?? false;

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const clan = character.clan_id ? await this.clanRepo.findById(character.clan_id) : null;
      const characterKeywords = await this.characterKeywordRepo.findByCharacterId(inputDto.character_id);
      const keywordIds = characterKeywords.map((r) => r.keyword_id);
      log.steps.push({ message: `Retrieved clan and ${keywordIds.length} keyword(s) for dt_cost calculation.` });

      const allProgress = await this.progressRepo.findByCharacterId(inputDto.character_id);
      const progressByContentId = new Map<string, ICharacterLearningProgressV1Dto>(
        allProgress.map((p) => [p.trainable_content_id, p]),
      );
      log.steps.push({ message: `Retrieved ${allProgress.length} existing learning progress record(s).` });

      const affinities = new Set<JutsuElement>(character.elemental_releases);

      // ── Library entries ─────────────────────────────────────────────────────
      const libraryEntries: ICatalogEntryV1Dto[] = [];
      const charLibraries = await this.characterLibraryRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Character has ${charLibraries.length} library access(es).` });

      for (const charLib of charLibraries) {
        const scrolls = await this.libraryScrollRepo.findByLibraryId(charLib.library_id);
        for (const scroll of scrolls) {
          const content = await this.contentRepo.findByJutsuId(scroll.jutsu_id);
          if (!content) continue;

          const jutsu = await this.jutsuRepo.findById(scroll.jutsu_id);
          if (!jutsu) continue;

          if (!includeIneligible && !this.isJutsuEligible(jutsu.elements, affinities)) continue;

          const dtCost = calculateDtCost(content.base_dt_cost, clan?.dt_modifiers ?? [], keywordIds);
          libraryEntries.push({
            trainable_content: content,
            jutsu,
            dt_cost: dtCost,
            source: { type: 'library', library_id: charLib.library_id },
            learning_progress: progressByContentId.get(content._id) ?? null,
          });
        }
      }
      log.steps.push({ message: `Built ${libraryEntries.length} library catalog entry(ies).` });

      // ── Sensei entries ───────────────────────────────────────────────────────
      const senseiEntries: ICatalogEntryV1Dto[] = [];
      const charSenseis = await this.characterSenseiRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Character has ${charSenseis.length} sensei(s).` });

      for (const charSensei of charSenseis) {
        const senseiContents = await this.senseiContentRepo.findBySenseiId(charSensei.sensei_id);
        for (const sc of senseiContents) {
          if (charSensei.proximity < sc.required_proximity) continue;

          const content = await this.contentRepo.findById(sc.trainable_content_id);
          if (!content) continue;

          let jutsu: IJutsuV1Dto | null = null;
          if (content.type === 'jutsu' && content.jutsu_id) {
            jutsu = await this.jutsuRepo.findById(content.jutsu_id);
            if (!includeIneligible && jutsu && !this.isJutsuEligible(jutsu.elements, affinities)) continue;
          }

          const dtCost = calculateDtCost(content.base_dt_cost, clan?.dt_modifiers ?? [], keywordIds);
          senseiEntries.push({
            trainable_content: content,
            jutsu,
            dt_cost: dtCost,
            source: { type: 'sensei', sensei_id: charSensei.sensei_id },
            learning_progress: progressByContentId.get(content._id) ?? null,
          });
        }
      }
      log.steps.push({ message: `Built ${senseiEntries.length} sensei catalog entry(ies).` });

      logInfo(`Training catalog retrieved for character ${inputDto.character_id}`, log);
      return { library_entries: libraryEntries, sensei_entries: senseiEntries };
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving training catalog.' });
      logError('Error retrieving training catalog', log);
      throw err;
    }
  }

  private isJutsuEligible(jutsuElements: JutsuElement[], affinities: Set<JutsuElement>): boolean {
    if (jutsuElements.length === 0) return true;
    return jutsuElements.some((el) => affinities.has(el));
  }
}
