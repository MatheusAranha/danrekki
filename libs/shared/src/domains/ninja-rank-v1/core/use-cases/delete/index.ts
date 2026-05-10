import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { NinjaRankV1DatabaseRepository } from '../../database-repository';
import { NinjaRankV1NotFoundError } from '../../errors';
import { IDeleteNinjaRankV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteNinjaRankV1UseCase {
  constructor(private readonly ninjaRankRepository: NinjaRankV1DatabaseRepository) {}

  async execute(inputDto: IDeleteNinjaRankV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteNinjaRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.ninjaRankRepository.findById(inputDto.id);
      if (!existing) throw new NinjaRankV1NotFoundError(`NinjaRank with id "${inputDto.id}" not found`);
      log.steps.push({ message: `NinjaRank ${inputDto.id} found.` });

      await this.ninjaRankRepository.delete(inputDto.id);
      log.steps.push({ message: `NinjaRank ${inputDto.id} deleted.` });

      logInfo(`NinjaRank deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting NinjaRankV1.' });
      logError('Error deleting NinjaRankV1', log);
      throw err;
    }
  }
}
