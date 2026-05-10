import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterV1DatabaseRepository } from '../../database-repository';
import { CharacterV1NotFoundError } from '../../errors';
import { IGetCharacterV1UseCaseInputDto, IGetCharacterV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetCharacterV1UseCase {
  constructor(private readonly characterRepository: CharacterV1DatabaseRepository) {}

  async execute(inputDto: IGetCharacterV1UseCaseInputDto): Promise<IGetCharacterV1UseCaseOutputDto> {
    const log: ILog = { module: GetCharacterV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const character = await this.characterRepository.findById(inputDto.id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Character ${inputDto.id} retrieved.` });

      logInfo(`Character retrieved: ${character._id}`, log);
      return character;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving CharacterV1.' });
      logError('Error retrieving CharacterV1', log);
      throw err;
    }
  }
}
