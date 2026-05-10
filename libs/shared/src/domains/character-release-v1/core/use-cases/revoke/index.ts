import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterReleaseV1DatabaseRepository } from '../../database-repository';
import { CharacterReleaseV1NotFoundError } from '../../errors';
import { IRevokeCharacterReleaseV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class RevokeCharacterReleaseV1UseCase {
  constructor(private readonly characterReleaseRepo: CharacterReleaseV1DatabaseRepository) {}

  async execute(inputDto: IRevokeCharacterReleaseV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: RevokeCharacterReleaseV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.characterReleaseRepo.findById(inputDto.id);
      if (!existing) throw new CharacterReleaseV1NotFoundError(`CharacterRelease with id "${inputDto.id}" not found`);
      log.steps.push({ message: `CharacterRelease ${inputDto.id} found.` });

      await this.characterReleaseRepo.delete(inputDto.id);
      log.steps.push({ message: `CharacterRelease ${inputDto.id} deleted.` });

      logInfo(`CharacterRelease revoked: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while revoking CharacterReleaseV1.' });
      logError('Error revoking CharacterReleaseV1', log);
      throw err;
    }
  }
}
