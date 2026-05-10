import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterSenseiV1DatabaseRepository } from '../../database-repository';
import { CharacterSenseiV1NotFoundError } from '../../errors';
import { IDeleteCharacterSenseiV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteCharacterSenseiV1UseCase {
  constructor(private readonly characterSenseiRepo: CharacterSenseiV1DatabaseRepository) {}

  async execute(inputDto: IDeleteCharacterSenseiV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteCharacterSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.characterSenseiRepo.findById(inputDto.id);
      if (!existing) throw new CharacterSenseiV1NotFoundError(`CharacterSensei with id "${inputDto.id}" not found`);
      log.steps.push({ message: `CharacterSensei ${inputDto.id} found.` });

      await this.characterSenseiRepo.delete(inputDto.id);
      log.steps.push({ message: `CharacterSensei ${inputDto.id} deleted.` });

      logInfo(`CharacterSensei deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting CharacterSenseiV1.' });
      logError('Error deleting CharacterSenseiV1', log);
      throw err;
    }
  }
}
