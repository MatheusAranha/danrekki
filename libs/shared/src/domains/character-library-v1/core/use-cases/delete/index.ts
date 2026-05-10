import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLibraryV1DatabaseRepository } from '../../database-repository';
import { CharacterLibraryV1NotFoundError } from '../../errors';
import { IDeleteCharacterLibraryV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteCharacterLibraryV1UseCase {
  constructor(private readonly characterLibraryRepo: CharacterLibraryV1DatabaseRepository) {}

  async execute(inputDto: IDeleteCharacterLibraryV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteCharacterLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.characterLibraryRepo.findById(inputDto.id);
      if (!existing) throw new CharacterLibraryV1NotFoundError(`CharacterLibrary with id "${inputDto.id}" not found`);
      log.steps.push({ message: `CharacterLibrary ${inputDto.id} found.` });

      await this.characterLibraryRepo.delete(inputDto.id);
      log.steps.push({ message: `CharacterLibrary ${inputDto.id} deleted.` });

      logInfo(`CharacterLibrary deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting CharacterLibraryV1.' });
      logError('Error deleting CharacterLibraryV1', log);
      throw err;
    }
  }
}
