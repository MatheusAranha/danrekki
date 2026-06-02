import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { KeywordV1DatabaseRepository } from '../../database-repository';
import { KeywordV1NotFoundError } from '../../errors';
import { IDeleteKeywordV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteKeywordV1UseCase {
  constructor(private readonly keywordRepository: KeywordV1DatabaseRepository) {}

  async execute(inputDto: IDeleteKeywordV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteKeywordV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.keywordRepository.findById(inputDto.id);
      if (!existing) throw new KeywordV1NotFoundError(`Keyword with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Release ${inputDto.id} found.` });

      await this.keywordRepository.delete(inputDto.id);
      log.steps.push({ message: `Release ${inputDto.id} deleted.` });

      logInfo(`Keyword deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting KeywordV1.' });
      logError('Error deleting KeywordV1', log);
      throw err;
    }
  }
}
