import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterSenseiV1DatabaseRepository } from '../../database-repository';
import { CharacterSenseiV1NotFoundError } from '../../errors';
import { IGetCharacterSenseiV1UseCaseInputDto, IGetCharacterSenseiV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetCharacterSenseiV1UseCase {
  constructor(private readonly characterSenseiRepo: CharacterSenseiV1DatabaseRepository) {}

  async execute(inputDto: IGetCharacterSenseiV1UseCaseInputDto): Promise<IGetCharacterSenseiV1UseCaseOutputDto> {
    const log: ILog = { module: GetCharacterSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const characterSensei = await this.characterSenseiRepo.findById(inputDto.id);
      if (!characterSensei) throw new CharacterSenseiV1NotFoundError(`CharacterSensei with id "${inputDto.id}" not found`);
      log.steps.push({ message: `CharacterSensei ${inputDto.id} retrieved.` });

      logInfo(`CharacterSensei retrieved: ${characterSensei._id}`, log);
      return characterSensei;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving CharacterSenseiV1.' });
      logError('Error retrieving CharacterSenseiV1', log);
      throw err;
    }
  }
}
