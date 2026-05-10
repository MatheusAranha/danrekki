import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuV1DatabaseRepository } from '../../database-repository';
import { JutsuV1NotFoundError } from '../../errors';
import { IGetJutsuV1UseCaseInputDto, IGetJutsuV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetJutsuV1UseCase {
  constructor(private readonly jutsuRepository: JutsuV1DatabaseRepository) {}

  async execute(inputDto: IGetJutsuV1UseCaseInputDto): Promise<IGetJutsuV1UseCaseOutputDto> {
    const log: ILog = { module: GetJutsuV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const jutsu = await this.jutsuRepository.findById(inputDto.id);
      if (!jutsu) throw new JutsuV1NotFoundError(`Jutsu with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Jutsu ${inputDto.id} retrieved.` });

      logInfo(`Jutsu retrieved: ${jutsu._id}`, log);
      return jutsu;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving JutsuV1.' });
      logError('Error retrieving JutsuV1', log);
      throw err;
    }
  }
}
