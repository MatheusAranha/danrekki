import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { NinjaRankV1DatabaseRepository } from '../../database-repository';
import { NinjaRankV1NotFoundError } from '../../errors';
import { IGetNinjaRankV1UseCaseInputDto, IGetNinjaRankV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetNinjaRankV1UseCase {
  constructor(private readonly ninjaRankRepository: NinjaRankV1DatabaseRepository) {}

  async execute(inputDto: IGetNinjaRankV1UseCaseInputDto): Promise<IGetNinjaRankV1UseCaseOutputDto> {
    const log: ILog = { module: GetNinjaRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const ninjaRank = await this.ninjaRankRepository.findById(inputDto.id);
      if (!ninjaRank) throw new NinjaRankV1NotFoundError(`NinjaRank with id "${inputDto.id}" not found`);
      log.steps.push({ message: `NinjaRank ${inputDto.id} retrieved.` });

      logInfo(`NinjaRank retrieved: ${ninjaRank._id}`, log);
      return ninjaRank;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving NinjaRankV1.' });
      logError('Error retrieving NinjaRankV1', log);
      throw err;
    }
  }
}
