import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterV1DatabaseRepository } from '../../database-repository';
import { CharacterV1NotFoundError } from '../../errors';
import { IDeleteCharacterV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteCharacterV1UseCase {
  constructor(private readonly characterRepository: CharacterV1DatabaseRepository) {}

  async execute(inputDto: IDeleteCharacterV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteCharacterV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.characterRepository.findById(inputDto.id);
      if (!existing) throw new CharacterV1NotFoundError(`Character with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Character ${inputDto.id} found.` });

      await this.characterRepository.delete(inputDto.id);
      log.steps.push({ message: `Character ${inputDto.id} deleted.` });

      logInfo(`Character deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting CharacterV1.' });
      logError('Error deleting CharacterV1', log);
      throw err;
    }
  }
}
