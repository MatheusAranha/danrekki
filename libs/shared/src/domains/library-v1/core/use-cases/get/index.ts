import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryV1DatabaseRepository } from '../../database-repository';
import { LibraryV1NotFoundError } from '../../errors';
import { IGetLibraryV1UseCaseInputDto, IGetLibraryV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetLibraryV1UseCase {
  constructor(private readonly libraryRepository: LibraryV1DatabaseRepository) {}

  async execute(inputDto: IGetLibraryV1UseCaseInputDto): Promise<IGetLibraryV1UseCaseOutputDto> {
    const log: ILog = { module: GetLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const library = await this.libraryRepository.findById(inputDto.id);
      if (!library) throw new LibraryV1NotFoundError(`Library with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Library ${inputDto.id} retrieved.` });

      logInfo(`Library retrieved: ${library._id}`, log);
      return library;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving LibraryV1.' });
      logError('Error retrieving LibraryV1', log);
      throw err;
    }
  }
}
