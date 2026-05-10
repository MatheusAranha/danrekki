import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { NinjaRankV1DatabaseRepository } from '../../database-repository';
import { NinjaRankV1NotFoundError, NinjaRankV1NameAlreadyExistsError } from '../../errors';
import { updateNinjaRankV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateNinjaRankV1UseCaseInputDto, IUpdateNinjaRankV1UseCaseOutputDto } from './types';

export class UpdateNinjaRankV1UseCase {
  constructor(private readonly ninjaRankRepository: NinjaRankV1DatabaseRepository) {}

  async execute(inputDto: IUpdateNinjaRankV1UseCaseInputDto): Promise<IUpdateNinjaRankV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateNinjaRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateNinjaRankV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.ninjaRankRepository.findById(inputDto.id);
      if (!existing) throw new NinjaRankV1NotFoundError(`NinjaRank with id "${inputDto.id}" not found`);
      log.steps.push({ message: `NinjaRank ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.ninjaRankRepository.findByName(inputDto.name);
        if (nameConflict) throw new NinjaRankV1NameAlreadyExistsError(`NinjaRank name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.ninjaRankRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.order !== undefined && { order: inputDto.order }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `NinjaRank ${inputDto.id} updated.` });

      logInfo(`NinjaRank updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating NinjaRankV1.' });
      logError('Error updating NinjaRankV1', log);
      throw err;
    }
  }
}
