import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuRankV1DatabaseRepository } from '../../database-repository';
import { JutsuRankV1NotFoundError } from '../../errors';
import { IGetJutsuRankV1UseCaseInputDto, IGetJutsuRankV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetJutsuRankV1UseCase {
  constructor(private readonly jutsuRankRepository: JutsuRankV1DatabaseRepository) {}

  async execute(inputDto: IGetJutsuRankV1UseCaseInputDto): Promise<IGetJutsuRankV1UseCaseOutputDto> {
    const log: ILog = { module: GetJutsuRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const jutsuRank = await this.jutsuRankRepository.findById(inputDto.id);
      if (!jutsuRank) throw new JutsuRankV1NotFoundError(`JutsuRank with id "${inputDto.id}" not found`);
      log.steps.push({ message: `JutsuRank ${inputDto.id} retrieved.` });

      logInfo(`JutsuRank retrieved: ${jutsuRank._id}`, log);
      return jutsuRank;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving JutsuRankV1.' });
      logError('Error retrieving JutsuRankV1', log);
      throw err;
    }
  }
}
