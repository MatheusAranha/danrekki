import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiContentV1DatabaseRepository } from '../../database-repository';
import { SenseiContentV1NotFoundError } from '../../errors';
import { IDeleteSenseiContentV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteSenseiContentV1UseCase {
  constructor(private readonly senseiContentRepo: SenseiContentV1DatabaseRepository) {}

  async execute(inputDto: IDeleteSenseiContentV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteSenseiContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.senseiContentRepo.findById(inputDto.id);
      if (!existing) throw new SenseiContentV1NotFoundError(`SenseiContent with id "${inputDto.id}" not found`);
      log.steps.push({ message: `SenseiContent ${inputDto.id} found.` });

      await this.senseiContentRepo.delete(inputDto.id);
      log.steps.push({ message: `SenseiContent ${inputDto.id} deleted.` });

      logInfo(`SenseiContent deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting SenseiContentV1.' });
      logError('Error deleting SenseiContentV1', log);
      throw err;
    }
  }
}
