import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiContentV1DatabaseRepository } from '../../database-repository';
import { IListBySenseiSenseiContentV1UseCaseInputDto, IListBySenseiSenseiContentV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['sensei_id'],
  additionalProperties: false,
  properties: { sensei_id: { type: 'string', minLength: 1 } },
};

export class ListBySenseiSenseiContentV1UseCase {
  constructor(private readonly senseiContentRepo: SenseiContentV1DatabaseRepository) {}

  async execute(inputDto: IListBySenseiSenseiContentV1UseCaseInputDto): Promise<IListBySenseiSenseiContentV1UseCaseOutputDto> {
    const log: ILog = { module: ListBySenseiSenseiContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const contents = await this.senseiContentRepo.findBySenseiId(inputDto.sensei_id);
      log.steps.push({ message: `Retrieved ${contents.length} sensei contents for sensei ${inputDto.sensei_id}.` });

      logInfo(`SenseiContents listed for sensei ${inputDto.sensei_id}.`, log);
      return contents;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing SenseiContentV1 by sensei.' });
      logError('Error listing SenseiContentV1 by sensei', log);
      throw err;
    }
  }
}
