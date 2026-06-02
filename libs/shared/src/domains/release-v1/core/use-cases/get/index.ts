import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { KeywordV1DatabaseRepository } from '../../database-repository';
import { KeywordV1NotFoundError } from '../../errors';
import { IGetKeywordV1UseCaseInputDto, IGetKeywordV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetKeywordV1UseCase {
  constructor(private readonly keywordRepository: KeywordV1DatabaseRepository) {}

  async execute(inputDto: IGetKeywordV1UseCaseInputDto): Promise<IGetKeywordV1UseCaseOutputDto> {
    const log: ILog = { module: GetKeywordV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const keyword = await this.keywordRepository.findById(inputDto.id);
      if (!keyword) throw new KeywordV1NotFoundError(`Keyword with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Keyword ${inputDto.id} retrieved.` });

      logInfo(`Keyword retrieved: ${keyword._id}`, log);
      return keyword;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving KeywordV1.' });
      logError('Error retrieving KeywordV1', log);
      throw err;
    }
  }
}
