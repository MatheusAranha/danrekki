import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterReleaseV1DatabaseRepository } from '../../database-repository';
import { IListByCharacterCharacterReleaseV1UseCaseInputDto, IListByCharacterCharacterReleaseV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id'],
  additionalProperties: false,
  properties: { character_id: { type: 'string', minLength: 1 } },
};

export class ListByCharacterCharacterReleaseV1UseCase {
  constructor(private readonly characterReleaseRepo: CharacterReleaseV1DatabaseRepository) {}

  async execute(inputDto: IListByCharacterCharacterReleaseV1UseCaseInputDto): Promise<IListByCharacterCharacterReleaseV1UseCaseOutputDto> {
    const log: ILog = { module: ListByCharacterCharacterReleaseV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const releases = await this.characterReleaseRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Retrieved ${releases.length} character releases for character ${inputDto.character_id}.` });

      logInfo(`CharacterReleases listed for character: ${inputDto.character_id}`, log);
      return releases;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing CharacterReleasesV1 by character.' });
      logError('Error listing CharacterReleasesV1 by character', log);
      throw err;
    }
  }
}
