import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLibraryV1DatabaseRepository } from '../../database-repository';
import { CharacterLibraryV1NotFoundError } from '../../errors';
import { IGetCharacterLibraryV1UseCaseInputDto, IGetCharacterLibraryV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetCharacterLibraryV1UseCase {
  constructor(private readonly characterLibraryRepo: CharacterLibraryV1DatabaseRepository) {}

  async execute(inputDto: IGetCharacterLibraryV1UseCaseInputDto): Promise<IGetCharacterLibraryV1UseCaseOutputDto> {
    const log: ILog = { module: GetCharacterLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const characterLibrary = await this.characterLibraryRepo.findById(inputDto.id);
      if (!characterLibrary) throw new CharacterLibraryV1NotFoundError(`CharacterLibrary with id "${inputDto.id}" not found`);
      log.steps.push({ message: `CharacterLibrary ${inputDto.id} retrieved.` });

      logInfo(`CharacterLibrary retrieved: ${characterLibrary._id}`, log);
      return characterLibrary;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving CharacterLibraryV1.' });
      logError('Error retrieving CharacterLibraryV1', log);
      throw err;
    }
  }
}
