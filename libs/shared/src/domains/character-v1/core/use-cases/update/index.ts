import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterV1DatabaseRepository } from '../../database-repository';
import { CharacterV1NotFoundError } from '../../errors';
import { updateCharacterV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateCharacterV1UseCaseInputDto, IUpdateCharacterV1UseCaseOutputDto } from './types';

export class UpdateCharacterV1UseCase {
  constructor(private readonly characterRepository: CharacterV1DatabaseRepository) {}

  async execute(inputDto: IUpdateCharacterV1UseCaseInputDto): Promise<IUpdateCharacterV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateCharacterV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateCharacterV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.characterRepository.findById(inputDto.id);
      if (!existing) throw new CharacterV1NotFoundError(`Character with id "${inputDto.id}" not found`);
      log.steps.push({ message: `Character ${inputDto.id} found.` });

      const updated = await this.characterRepository.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.clan_id !== undefined && { clan_id: inputDto.clan_id }),
        ...(inputDto.elemental_releases !== undefined && { elemental_releases: inputDto.elemental_releases }),
        ...(inputDto.picture_url !== undefined && { picture_url: inputDto.picture_url }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `Character ${inputDto.id} updated.` });

      logInfo(`Character updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating CharacterV1.' });
      logError('Error updating CharacterV1', log);
      throw err;
    }
  }
}
