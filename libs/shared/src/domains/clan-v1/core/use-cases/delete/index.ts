import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ClanV1DatabaseRepository } from '../../database-repository';
import { ClanV1NotFoundError } from '../../errors';
import { IDeleteClanV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteClanV1UseCase {
  constructor(private readonly clanRepository: ClanV1DatabaseRepository) {}

  async execute(inputDto: IDeleteClanV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteClanV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.clanRepository.findById(inputDto.id);
      if (!existing) throw new ClanV1NotFoundError(`Clan with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Clan ${inputDto.id} found.` });

      await this.clanRepository.delete(inputDto.id);
      log.steps.push({ message: `Clan ${inputDto.id} deleted.` });

      logInfo(`Clan deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting ClanV1.' });
      logError('Error deleting ClanV1', log);
      throw err;
    }
  }
}
