import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiV1DatabaseRepository } from '../../database-repository';
import { SenseiV1NotFoundError } from '../../errors';
import { IDeleteSenseiV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteSenseiV1UseCase {
  constructor(private readonly senseiRepository: SenseiV1DatabaseRepository) {}

  async execute(inputDto: IDeleteSenseiV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.senseiRepository.findById(inputDto.id);
      if (!existing) throw new SenseiV1NotFoundError(`Sensei with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Sensei ${inputDto.id} found.` });

      await this.senseiRepository.delete(inputDto.id);
      log.steps.push({ message: `Sensei ${inputDto.id} deleted.` });

      logInfo(`Sensei deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting SenseiV1.' });
      logError('Error deleting SenseiV1', log);
      throw err;
    }
  }
}
