import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryScrollV1DatabaseRepository } from '../../database-repository';
import { LibraryScrollV1NotFoundError } from '../../errors';
import { IDeleteLibraryScrollV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteLibraryScrollV1UseCase {
  constructor(private readonly scrollRepo: LibraryScrollV1DatabaseRepository) {}

  async execute(inputDto: IDeleteLibraryScrollV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteLibraryScrollV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.scrollRepo.findById(inputDto.id);
      if (!existing) throw new LibraryScrollV1NotFoundError(`LibraryScroll with id "${inputDto.id}" not found`);
      log.steps.push({ message: `LibraryScroll ${inputDto.id} found.` });

      await this.scrollRepo.delete(inputDto.id);
      log.steps.push({ message: `LibraryScroll ${inputDto.id} deleted.` });

      logInfo(`LibraryScroll deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting LibraryScrollV1.' });
      logError('Error deleting LibraryScrollV1', log);
      throw err;
    }
  }
}
