import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterKeywordV1DatabaseRepository } from '../../database-repository';
import { CharacterKeywordV1NotFoundError } from '../../errors';
import { IRevokeCharacterKeywordV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class RevokeCharacterKeywordV1UseCase {
  constructor(private readonly characterKeywordRepo: CharacterKeywordV1DatabaseRepository) {}

  async execute(inputDto: IRevokeCharacterKeywordV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: RevokeCharacterKeywordV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.characterKeywordRepo.findById(inputDto.id);
      if (!existing) throw new CharacterKeywordV1NotFoundError(`CharacterKeyword with id "${inputDto.id}" not found`);
      log.steps.push({ message: `CharacterRelease ${inputDto.id} found.` });

      await this.characterKeywordRepo.delete(inputDto.id);
      log.steps.push({ message: `CharacterRelease ${inputDto.id} deleted.` });

      logInfo(`CharacterKeyword revoked: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while revoking CharacterKeywordV1.' });
      logError('Error revoking CharacterKeywordV1', log);
      throw err;
    }
  }
}
