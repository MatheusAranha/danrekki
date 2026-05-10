import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryV1DatabaseRepository } from '../../database-repository';
import { LibraryV1NotFoundError, LibraryV1NameAlreadyExistsError } from '../../errors';
import { updateLibraryV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateLibraryV1UseCaseInputDto, IUpdateLibraryV1UseCaseOutputDto } from './types';

export class UpdateLibraryV1UseCase {
  constructor(private readonly libraryRepository: LibraryV1DatabaseRepository) {}

  async execute(inputDto: IUpdateLibraryV1UseCaseInputDto): Promise<IUpdateLibraryV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateLibraryV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.libraryRepository.findById(inputDto.id);
      if (!existing) throw new LibraryV1NotFoundError(`Library with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Library ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.libraryRepository.findByName(inputDto.name);
        if (nameConflict) throw new LibraryV1NameAlreadyExistsError(`Library name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.libraryRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.description !== undefined && { description: inputDto.description }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Library ${inputDto.id} updated.` });

      logInfo(`Library updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating LibraryV1.' });
      logError('Error updating LibraryV1', log);
      throw err;
    }
  }
}
