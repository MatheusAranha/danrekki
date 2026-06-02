import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { KeywordV1DatabaseRepository } from '../../database-repository';
import { KeywordV1NotFoundError, KeywordV1NameAlreadyExistsError } from '../../errors';
import { updateKeywordV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateKeywordV1UseCaseInputDto, IUpdateKeywordV1UseCaseOutputDto } from './types';

export class UpdateKeywordV1UseCase {
  constructor(private readonly keywordRepository: KeywordV1DatabaseRepository) {}

  async execute(inputDto: IUpdateKeywordV1UseCaseInputDto): Promise<IUpdateKeywordV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateKeywordV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateKeywordV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.keywordRepository.findById(inputDto.id);
      if (!existing) throw new KeywordV1NotFoundError(`Keyword with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Release ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.keywordRepository.findByName(inputDto.name);
        if (nameConflict) throw new KeywordV1NameAlreadyExistsError(`Keyword name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.keywordRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Release ${inputDto.id} updated.` });

      logInfo(`Keyword updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating KeywordV1.' });
      logError('Error updating KeywordV1', log);
      throw err;
    }
  }
}
