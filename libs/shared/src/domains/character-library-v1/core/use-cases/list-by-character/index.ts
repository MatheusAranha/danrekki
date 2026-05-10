import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLibraryV1DatabaseRepository } from '../../database-repository';
import { IListByCharacterCharacterLibraryV1UseCaseInputDto, IListByCharacterCharacterLibraryV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id'],
  additionalProperties: false,
  properties: { character_id: { type: 'string', minLength: 1 } },
};

export class ListByCharacterCharacterLibraryV1UseCase {
  constructor(private readonly characterLibraryRepo: CharacterLibraryV1DatabaseRepository) {}

  async execute(inputDto: IListByCharacterCharacterLibraryV1UseCaseInputDto): Promise<IListByCharacterCharacterLibraryV1UseCaseOutputDto> {
    const log: ILog = { module: ListByCharacterCharacterLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const libraries = await this.characterLibraryRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Retrieved ${libraries.length} character libraries for character ${inputDto.character_id}.` });

      logInfo(`CharacterLibraries listed for character: ${inputDto.character_id}`, log);
      return libraries;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing CharacterLibrariesV1 by character.' });
      logError('Error listing CharacterLibrariesV1 by character', log);
      throw err;
    }
  }
}
