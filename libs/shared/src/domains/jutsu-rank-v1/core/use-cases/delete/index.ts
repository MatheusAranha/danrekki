import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuRankV1DatabaseRepository } from '../../database-repository';
import { JutsuRankV1NotFoundError } from '../../errors';
import { IDeleteJutsuRankV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteJutsuRankV1UseCase {
  constructor(private readonly jutsuRankRepository: JutsuRankV1DatabaseRepository) {}

  async execute(inputDto: IDeleteJutsuRankV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteJutsuRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.jutsuRankRepository.findById(inputDto.id);
      if (!existing) throw new JutsuRankV1NotFoundError(`JutsuRank with id "${inputDto.id}" not found`);
      log.steps.push({ message: `JutsuRank ${inputDto.id} found.` });

      await this.jutsuRankRepository.delete(inputDto.id);
      log.steps.push({ message: `JutsuRank ${inputDto.id} deleted.` });

      logInfo(`JutsuRank deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting JutsuRankV1.' });
      logError('Error deleting JutsuRankV1', log);
      throw err;
    }
  }
}
