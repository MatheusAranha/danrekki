import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuRankV1DatabaseRepository } from '../../database-repository';
import { JutsuRankV1NotFoundError, JutsuRankV1NameAlreadyExistsError } from '../../errors';
import { updateJutsuRankV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateJutsuRankV1UseCaseInputDto, IUpdateJutsuRankV1UseCaseOutputDto } from './types';

export class UpdateJutsuRankV1UseCase {
  constructor(private readonly jutsuRankRepository: JutsuRankV1DatabaseRepository) {}

  async execute(inputDto: IUpdateJutsuRankV1UseCaseInputDto): Promise<IUpdateJutsuRankV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateJutsuRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateJutsuRankV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.jutsuRankRepository.findById(inputDto.id);
      if (!existing) throw new JutsuRankV1NotFoundError(`JutsuRank with id "${inputDto.id}" not found`);
      log.steps.push({ message: `JutsuRank ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.jutsuRankRepository.findByName(inputDto.name);
        if (nameConflict) throw new JutsuRankV1NameAlreadyExistsError(`JutsuRank name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.jutsuRankRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.order !== undefined && { order: inputDto.order }),
        ...(inputDto.dt_cost !== undefined && { dt_cost: inputDto.dt_cost }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `JutsuRank ${inputDto.id} updated.` });

      logInfo(`JutsuRank updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating JutsuRankV1.' });
      logError('Error updating JutsuRankV1', log);
      throw err;
    }
  }
}
