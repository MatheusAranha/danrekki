import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ClanV1DatabaseRepository } from '../../database-repository';
import { ClanV1NotFoundError, ClanV1NameAlreadyExistsError } from '../../errors';
import { updateClanV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateClanV1UseCaseInputDto, IUpdateClanV1UseCaseOutputDto } from './types';

export class UpdateClanV1UseCase {
  constructor(private readonly clanRepository: ClanV1DatabaseRepository) {}

  async execute(inputDto: IUpdateClanV1UseCaseInputDto): Promise<IUpdateClanV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateClanV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateClanV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.clanRepository.findById(inputDto.id);
      if (!existing) throw new ClanV1NotFoundError(`Clan with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Clan ${inputDto.id} found.` });

      if (inputDto.name && inputDto.name !== existing.name) {
        const nameConflict = await this.clanRepository.findByName(inputDto.name);
        if (nameConflict) throw new ClanV1NameAlreadyExistsError(`Clan name "${inputDto.name}" already exists`);
        log.steps.push({ message: 'Verified updated name is unique.' });
      }

      const updated = await this.clanRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.dt_modifiers !== undefined && { dt_modifiers: inputDto.dt_modifiers }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Clan ${inputDto.id} updated.` });

      logInfo(`Clan updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating ClanV1.' });
      logError('Error updating ClanV1', log);
      throw err;
    }
  }
}
