import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryScrollV1DatabaseRepository } from '../../database-repository';
import { LibraryScrollV1NotFoundError } from '../../errors';
import { IGetLibraryScrollV1UseCaseInputDto, IGetLibraryScrollV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetLibraryScrollV1UseCase {
  constructor(private readonly scrollRepo: LibraryScrollV1DatabaseRepository) {}

  async execute(inputDto: IGetLibraryScrollV1UseCaseInputDto): Promise<IGetLibraryScrollV1UseCaseOutputDto> {
    const log: ILog = { module: GetLibraryScrollV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const scroll = await this.scrollRepo.findById(inputDto.id);
      if (!scroll) throw new LibraryScrollV1NotFoundError(`LibraryScroll with id "${inputDto.id}" not found`);
      log.steps.push({ message: `LibraryScroll ${inputDto.id} retrieved.` });

      logInfo(`LibraryScroll retrieved: ${scroll._id}`, log);
      return scroll;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving LibraryScrollV1.' });
      logError('Error retrieving LibraryScrollV1', log);
      throw err;
    }
  }
}
