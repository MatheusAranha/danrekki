import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryScrollV1DatabaseRepository } from '../../database-repository';
import { IListLibraryScrollsByLibraryV1UseCaseInputDto, IListLibraryScrollsByLibraryV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['library_id'],
  additionalProperties: false,
  properties: { library_id: { type: 'string', minLength: 1 } },
};

export class ListLibraryScrollsByLibraryV1UseCase {
  constructor(private readonly scrollRepo: LibraryScrollV1DatabaseRepository) {}

  async execute(inputDto: IListLibraryScrollsByLibraryV1UseCaseInputDto): Promise<IListLibraryScrollsByLibraryV1UseCaseOutputDto> {
    const log: ILog = { module: ListLibraryScrollsByLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const scrolls = await this.scrollRepo.findByLibraryId(inputDto.library_id);
      log.steps.push({ message: `Retrieved ${scrolls.length} scrolls for library ${inputDto.library_id}.` });

      logInfo(`LibraryScrolls listed for library: ${inputDto.library_id}`, log);
      return scrolls;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing LibraryScrollsV1 by library.' });
      logError('Error listing LibraryScrollsV1 by library', log);
      throw err;
    }
  }
}
