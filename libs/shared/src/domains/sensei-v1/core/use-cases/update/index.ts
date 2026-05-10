import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiV1DatabaseRepository } from '../../database-repository';
import { SenseiV1NotFoundError, SenseiV1NameAlreadyExistsError } from '../../errors';
import { updateSenseiV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateSenseiV1UseCaseInputDto, IUpdateSenseiV1UseCaseOutputDto } from './types';

export class UpdateSenseiV1UseCase {
  constructor(private readonly senseiRepository: SenseiV1DatabaseRepository) {}

  async execute(inputDto: IUpdateSenseiV1UseCaseInputDto): Promise<IUpdateSenseiV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateSenseiV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.senseiRepository.findById(inputDto.id);
      if (!existing) throw new SenseiV1NotFoundError(`Sensei with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Sensei ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.senseiRepository.findByName(inputDto.name);
        if (nameConflict) throw new SenseiV1NameAlreadyExistsError(`Sensei name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.senseiRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.description !== undefined && { description: inputDto.description }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Sensei ${inputDto.id} updated.` });

      logInfo(`Sensei updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating SenseiV1.' });
      logError('Error updating SenseiV1', log);
      throw err;
    }
  }
}
