import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuV1DatabaseRepository } from '../../database-repository';
import { JutsuV1NotFoundError } from '../../errors';
import { IDeleteJutsuV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteJutsuV1UseCase {
  constructor(private readonly jutsuRepository: JutsuV1DatabaseRepository) {}

  async execute(inputDto: IDeleteJutsuV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteJutsuV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.jutsuRepository.findById(inputDto.id);
      if (!existing) throw new JutsuV1NotFoundError(`Jutsu with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Jutsu ${inputDto.id} found.` });

      await this.jutsuRepository.delete(inputDto.id);
      log.steps.push({ message: `Jutsu ${inputDto.id} deleted.` });

      logInfo(`Jutsu deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting JutsuV1.' });
      logError('Error deleting JutsuV1', log);
      throw err;
    }
  }
}
