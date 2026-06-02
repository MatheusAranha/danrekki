import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterKeywordV1DatabaseRepository } from '../../database-repository';
import { IListByCharacterCharacterKeywordV1UseCaseInputDto, IListByCharacterCharacterKeywordV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id'],
  additionalProperties: false,
  properties: { character_id: { type: 'string', minLength: 1 } },
};

export class ListByCharacterCharacterKeywordV1UseCase {
  constructor(private readonly characterKeywordRepo: CharacterKeywordV1DatabaseRepository) {}

  async execute(inputDto: IListByCharacterCharacterKeywordV1UseCaseInputDto): Promise<IListByCharacterCharacterKeywordV1UseCaseOutputDto> {
    const log: ILog = { module: ListByCharacterCharacterKeywordV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const keywords = await this.characterKeywordRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Retrieved ${keywords.length} character keywords for character ${inputDto.character_id}.` });

      logInfo(`CharacterKeywords listed for character: ${inputDto.character_id}`, log);
      return keywords;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing CharacterKeywordsV1 by character.' });
      logError('Error listing CharacterKeywordsV1 by character', log);
      throw err;
    }
  }
}
