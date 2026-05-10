import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterSenseiV1DatabaseRepository } from '../../database-repository';
import { IListByCharacterCharacterSenseiV1UseCaseInputDto, IListByCharacterCharacterSenseiV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id'],
  additionalProperties: false,
  properties: { character_id: { type: 'string', minLength: 1 } },
};

export class ListByCharacterCharacterSenseiV1UseCase {
  constructor(private readonly characterSenseiRepo: CharacterSenseiV1DatabaseRepository) {}

  async execute(inputDto: IListByCharacterCharacterSenseiV1UseCaseInputDto): Promise<IListByCharacterCharacterSenseiV1UseCaseOutputDto> {
    const log: ILog = { module: ListByCharacterCharacterSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const senseis = await this.characterSenseiRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Retrieved ${senseis.length} character senseis for character ${inputDto.character_id}.` });

      logInfo(`CharacterSenseis listed for character: ${inputDto.character_id}`, log);
      return senseis;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing CharacterSenseisV1 by character.' });
      logError('Error listing CharacterSenseisV1 by character', log);
      throw err;
    }
  }
}
