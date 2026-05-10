import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ReleaseV1DatabaseRepository } from '../../database-repository';
import { ReleaseV1NotFoundError } from '../../errors';
import { IGetReleaseV1UseCaseInputDto, IGetReleaseV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetReleaseV1UseCase {
  constructor(private readonly releaseRepository: ReleaseV1DatabaseRepository) {}

  async execute(inputDto: IGetReleaseV1UseCaseInputDto): Promise<IGetReleaseV1UseCaseOutputDto> {
    const log: ILog = { module: GetReleaseV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const release = await this.releaseRepository.findById(inputDto.id);
      if (!release) throw new ReleaseV1NotFoundError(`Release with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Release ${inputDto.id} retrieved.` });

      logInfo(`Release retrieved: ${release._id}`, log);
      return release;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving ReleaseV1.' });
      logError('Error retrieving ReleaseV1', log);
      throw err;
    }
  }
}
