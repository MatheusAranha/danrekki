import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiContentV1DatabaseRepository } from '../../database-repository';
import { SenseiContentV1NotFoundError } from '../../errors';
import { IGetSenseiContentV1UseCaseInputDto, IGetSenseiContentV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetSenseiContentV1UseCase {
  constructor(private readonly senseiContentRepo: SenseiContentV1DatabaseRepository) {}

  async execute(inputDto: IGetSenseiContentV1UseCaseInputDto): Promise<IGetSenseiContentV1UseCaseOutputDto> {
    const log: ILog = { module: GetSenseiContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const senseiContent = await this.senseiContentRepo.findById(inputDto.id);
      if (!senseiContent) throw new SenseiContentV1NotFoundError(`SenseiContent with id "${inputDto.id}" not found`);
      log.steps.push({ message: `SenseiContent ${inputDto.id} retrieved.` });

      logInfo(`SenseiContent retrieved: ${senseiContent._id}`, log);
      return senseiContent;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving SenseiContentV1.' });
      logError('Error retrieving SenseiContentV1', log);
      throw err;
    }
  }
}
