import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiV1DatabaseRepository } from '../../database-repository';
import { SenseiV1NotFoundError } from '../../errors';
import { IGetSenseiV1UseCaseInputDto, IGetSenseiV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetSenseiV1UseCase {
  constructor(private readonly senseiRepository: SenseiV1DatabaseRepository) {}

  async execute(inputDto: IGetSenseiV1UseCaseInputDto): Promise<IGetSenseiV1UseCaseOutputDto> {
    const log: ILog = { module: GetSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const sensei = await this.senseiRepository.findById(inputDto.id);
      if (!sensei) throw new SenseiV1NotFoundError(`Sensei with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Sensei ${inputDto.id} retrieved.` });

      logInfo(`Sensei retrieved: ${sensei._id}`, log);
      return sensei;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving SenseiV1.' });
      logError('Error retrieving SenseiV1', log);
      throw err;
    }
  }
}
