import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ReleaseV1DatabaseRepository } from '../../database-repository';
import { ReleaseV1NotFoundError } from '../../errors';
import { IDeleteReleaseV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteReleaseV1UseCase {
  constructor(private readonly releaseRepository: ReleaseV1DatabaseRepository) {}

  async execute(inputDto: IDeleteReleaseV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteReleaseV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.releaseRepository.findById(inputDto.id);
      if (!existing) throw new ReleaseV1NotFoundError(`Release with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Release ${inputDto.id} found.` });

      await this.releaseRepository.delete(inputDto.id);
      log.steps.push({ message: `Release ${inputDto.id} deleted.` });

      logInfo(`Release deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting ReleaseV1.' });
      logError('Error deleting ReleaseV1', log);
      throw err;
    }
  }
}
