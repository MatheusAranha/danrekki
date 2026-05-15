import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { DtTransactionV1DatabaseRepository } from '../../database-repository';
import { IListByCharacterDtTransactionV1UseCaseInputDto, IListByCharacterDtTransactionV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id'],
  additionalProperties: false,
  properties: { character_id: { type: 'string', minLength: 1 } },
};

export class ListByCharacterDtTransactionV1UseCase {
  constructor(private readonly transactionRepo: DtTransactionV1DatabaseRepository) {}

  async execute(inputDto: IListByCharacterDtTransactionV1UseCaseInputDto): Promise<IListByCharacterDtTransactionV1UseCaseOutputDto> {
    const log: ILog = { module: ListByCharacterDtTransactionV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const transactions = await this.transactionRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Retrieved ${transactions.length} dt transactions for character ${inputDto.character_id}.` });

      logInfo(`DtTransactions listed for character: ${inputDto.character_id}`, log);
      return transactions;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing DtTransactionV1 by character.' });
      logError('Error listing DtTransactionV1 by character', log);
      throw err;
    }
  }
}
