import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryV1DatabaseRepository } from '../../database-repository';
import { LibraryV1NotFoundError } from '../../errors';
import { IDeleteLibraryV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteLibraryV1UseCase {
  constructor(private readonly libraryRepository: LibraryV1DatabaseRepository) {}

  async execute(inputDto: IDeleteLibraryV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.libraryRepository.findById(inputDto.id);
      if (!existing) throw new LibraryV1NotFoundError(`Library with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Library ${inputDto.id} found.` });

      await this.libraryRepository.delete(inputDto.id);
      log.steps.push({ message: `Library ${inputDto.id} deleted.` });

      logInfo(`Library deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting LibraryV1.' });
      logError('Error deleting LibraryV1', log);
      throw err;
    }
  }
}
