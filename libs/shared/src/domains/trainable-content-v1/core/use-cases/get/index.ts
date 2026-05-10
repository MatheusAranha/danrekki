import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { TrainableContentV1DatabaseRepository } from '../../database-repository';
import { TrainableContentV1NotFoundError } from '../../errors';
import { IGetTrainableContentV1UseCaseInputDto, IGetTrainableContentV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetTrainableContentV1UseCase {
  constructor(private readonly contentRepo: TrainableContentV1DatabaseRepository) {}

  async execute(inputDto: IGetTrainableContentV1UseCaseInputDto): Promise<IGetTrainableContentV1UseCaseOutputDto> {
    const log: ILog = { module: GetTrainableContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const content = await this.contentRepo.findById(inputDto.id);
      if (!content) throw new TrainableContentV1NotFoundError(`TrainableContent with id "${inputDto.id}" not found`);
      log.steps.push({ message: `TrainableContent ${inputDto.id} retrieved.` });

      logInfo(`TrainableContent retrieved: ${content._id}`, log);
      return content;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving TrainableContentV1.' });
      logError('Error retrieving TrainableContentV1', log);
      throw err;
    }
  }
}
