import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { TrainableContentV1DatabaseRepository } from '../../database-repository';
import { TrainableContentV1NotFoundError } from '../../errors';
import { IDeleteTrainableContentV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteTrainableContentV1UseCase {
  constructor(private readonly contentRepo: TrainableContentV1DatabaseRepository) {}

  async execute(inputDto: IDeleteTrainableContentV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteTrainableContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.contentRepo.findById(inputDto.id);
      if (!existing) throw new TrainableContentV1NotFoundError(`TrainableContent with id "${inputDto.id}" not found`);
      log.steps.push({ message: `TrainableContent ${inputDto.id} found.` });

      await this.contentRepo.delete(inputDto.id);
      log.steps.push({ message: `TrainableContent ${inputDto.id} deleted.` });

      logInfo(`TrainableContent deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting TrainableContentV1.' });
      logError('Error deleting TrainableContentV1', log);
      throw err;
    }
  }
}
