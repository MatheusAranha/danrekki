import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterKeywordV1DatabaseRepository } from '../../database-repository';
import { CharacterKeywordV1Entity } from '../../entity';
import { CharacterKeywordV1AlreadyAssignedError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { KeywordV1DatabaseRepository } from '../../../../release-v1/core/database-repository';
import { KeywordV1NotFoundError } from '../../../../release-v1/core/errors';
import { IAssignCharacterKeywordV1UseCaseInputDto, IAssignCharacterKeywordV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id', 'keyword_id'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    keyword_id: { type: 'string', minLength: 1 },
  },
};

export class AssignCharacterKeywordV1UseCase {
  constructor(
    private readonly characterKeywordRepo: CharacterKeywordV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly keywordRepo: KeywordV1DatabaseRepository,
  ) {}

  async execute(inputDto: IAssignCharacterKeywordV1UseCaseInputDto): Promise<IAssignCharacterKeywordV1UseCaseOutputDto> {
    const log: ILog = { module: AssignCharacterKeywordV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const keyword = await this.keywordRepo.findById(inputDto.keyword_id);
      if (!keyword) throw new KeywordV1NotFoundError(`Keyword with id "${inputDto.keyword_id}" not found`);
      log.steps.push({ message: `Release ${inputDto.keyword_id} found.` });

      const existing = await this.characterKeywordRepo.findByCharacterAndKeyword(inputDto.character_id, inputDto.keyword_id);
      if (existing) throw new CharacterKeywordV1AlreadyAssignedError(`Keyword "${inputDto.keyword_id}" is already assigned to character "${inputDto.character_id}"`);
      log.steps.push({ message: 'Verified assignment is unique.' });

      const dto = new CharacterKeywordV1Entity({
        characterKeywordInputData: {
          _id: randomUUID(),
          character_id: inputDto.character_id,
          keyword_id: inputDto.keyword_id,
          created_at: new Date().toISOString(),
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated CharacterKeywordV1Entity.' });

      const saved = await this.characterKeywordRepo.save(dto);
      log.steps.push({ message: `CharacterRelease persisted with id ${saved._id}.` });

      logInfo(`CharacterKeyword assigned: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while assigning CharacterKeywordV1.' });
      logError('Error assigning CharacterKeywordV1', log);
      throw err;
    }
  }
}
