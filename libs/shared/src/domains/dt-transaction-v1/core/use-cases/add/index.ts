import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { DtTransactionV1Entity } from '../../entity';
import { DtTransactionV1DatabaseRepository } from '../../database-repository';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { addDtTransactionV1InputDtoJsonSchema } from './input-dto.schema';
import { IAddDtTransactionV1UseCaseInputDto, IAddDtTransactionV1UseCaseOutputDto } from './types';

export class AddDtTransactionV1UseCase {
  constructor(
    private readonly transactionRepo: DtTransactionV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
  ) {}

  async execute(inputDto: IAddDtTransactionV1UseCaseInputDto): Promise<IAddDtTransactionV1UseCaseOutputDto> {
    const log: ILog = { module: AddDtTransactionV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(addDtTransactionV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const dto = new DtTransactionV1Entity({
        transactionInputData: {
          _id: randomUUID(),
          character_id: inputDto.character_id,
          amount: inputDto.amount,
          reason: inputDto.reason,
          created_at: new Date().toISOString(),
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated DtTransactionV1Entity.' });

      const saved = await this.transactionRepo.save(dto);
      log.steps.push({ message: `DtTransaction persisted with id ${saved._id}.` });

      await this.characterRepo.update(inputDto.character_id, {
        available_dt: character.available_dt + inputDto.amount,
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Character available_dt updated to ${character.available_dt + inputDto.amount}.` });

      logInfo(`DtTransaction added: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while adding DtTransactionV1.' });
      logError('Error adding DtTransactionV1', log);
      throw err;
    }
  }
}
