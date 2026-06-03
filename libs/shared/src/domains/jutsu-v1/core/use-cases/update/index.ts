import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuV1DatabaseRepository } from '../../database-repository';
import { JutsuV1NotFoundError, JutsuV1NameAlreadyExistsError } from '../../errors';
import { updateJutsuV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateJutsuV1UseCaseInputDto, IUpdateJutsuV1UseCaseOutputDto } from './types';

export class UpdateJutsuV1UseCase {
  constructor(private readonly jutsuRepository: JutsuV1DatabaseRepository) {}

  async execute(inputDto: IUpdateJutsuV1UseCaseInputDto): Promise<IUpdateJutsuV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateJutsuV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateJutsuV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.jutsuRepository.findById(inputDto.id);
      if (!existing) throw new JutsuV1NotFoundError(`Jutsu with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Jutsu ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.jutsuRepository.findByName(inputDto.name);
        if (nameConflict) throw new JutsuV1NameAlreadyExistsError(`Jutsu name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.jutsuRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.jutsu_rank_id !== undefined && { jutsu_rank_id: inputDto.jutsu_rank_id }),
        ...(inputDto.keyword_ids !== undefined && { keyword_ids: inputDto.keyword_ids }),
        ...(inputDto.elements !== undefined && { elements: inputDto.elements }),
        ...(inputDto.casting_time !== undefined && { casting_time: inputDto.casting_time }),
        ...(inputDto.range !== undefined && { range: inputDto.range }),
        ...(inputDto.chakra_cost !== undefined && { chakra_cost: inputDto.chakra_cost }),
        ...(inputDto.components !== undefined && { components: inputDto.components }),
        ...(inputDto.duration !== undefined && { duration: inputDto.duration }),
        ...(inputDto.description !== undefined && { description: inputDto.description }),
        ...(inputDto.at_higher_ranks !== undefined && { at_higher_ranks: inputDto.at_higher_ranks }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Jutsu ${inputDto.id} updated.` });

      logInfo(`Jutsu updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating JutsuV1.' });
      logError('Error updating JutsuV1', log);
      throw err;
    }
  }
}
