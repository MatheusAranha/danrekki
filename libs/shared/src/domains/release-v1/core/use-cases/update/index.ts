import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ReleaseV1DatabaseRepository } from '../../database-repository';
import { ReleaseV1NotFoundError, ReleaseV1NameAlreadyExistsError } from '../../errors';
import { updateReleaseV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateReleaseV1UseCaseInputDto, IUpdateReleaseV1UseCaseOutputDto } from './types';

export class UpdateReleaseV1UseCase {
  constructor(private readonly releaseRepository: ReleaseV1DatabaseRepository) {}

  async execute(inputDto: IUpdateReleaseV1UseCaseInputDto): Promise<IUpdateReleaseV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateReleaseV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateReleaseV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.releaseRepository.findById(inputDto.id);
      if (!existing) throw new ReleaseV1NotFoundError(`Release with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Release ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.releaseRepository.findByName(inputDto.name);
        if (nameConflict) throw new ReleaseV1NameAlreadyExistsError(`Release name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.releaseRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Release ${inputDto.id} updated.` });

      logInfo(`Release updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating ReleaseV1.' });
      logError('Error updating ReleaseV1', log);
      throw err;
    }
  }
}
