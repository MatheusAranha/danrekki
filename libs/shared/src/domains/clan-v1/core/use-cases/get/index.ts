import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ClanV1DatabaseRepository } from '../../database-repository';
import { ClanV1NotFoundError } from '../../errors';
import { IGetClanV1UseCaseInputDto, IGetClanV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetClanV1UseCase {
  constructor(private readonly clanRepository: ClanV1DatabaseRepository) {}

  async execute(inputDto: IGetClanV1UseCaseInputDto): Promise<IGetClanV1UseCaseOutputDto> {
    const log: ILog = { module: GetClanV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const clan = await this.clanRepository.findById(inputDto.id);
      if (!clan) throw new ClanV1NotFoundError(`Clan with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Clan ${inputDto.id} retrieved.` });

      logInfo(`Clan retrieved: ${clan._id}`, log);
      return clan;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving ClanV1.' });
      logError('Error retrieving ClanV1', log);
      throw err;
    }
  }
}
