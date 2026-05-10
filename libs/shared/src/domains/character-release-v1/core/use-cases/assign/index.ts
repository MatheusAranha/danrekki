import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterReleaseV1DatabaseRepository } from '../../database-repository';
import { CharacterReleaseV1Entity } from '../../entity';
import { CharacterReleaseV1AlreadyAssignedError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { ReleaseV1DatabaseRepository } from '../../../../release-v1/core/database-repository';
import { ReleaseV1NotFoundError } from '../../../../release-v1/core/errors';
import { IAssignCharacterReleaseV1UseCaseInputDto, IAssignCharacterReleaseV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id', 'release_id'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    release_id: { type: 'string', minLength: 1 },
  },
};

export class AssignCharacterReleaseV1UseCase {
  constructor(
    private readonly characterReleaseRepo: CharacterReleaseV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly releaseRepo: ReleaseV1DatabaseRepository,
  ) {}

  async execute(inputDto: IAssignCharacterReleaseV1UseCaseInputDto): Promise<IAssignCharacterReleaseV1UseCaseOutputDto> {
    const log: ILog = { module: AssignCharacterReleaseV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const release = await this.releaseRepo.findById(inputDto.release_id);
      if (!release) throw new ReleaseV1NotFoundError(`Release with id "${inputDto.release_id}" not found`);
      log.steps.push({ message: `Release ${inputDto.release_id} found.` });

      const existing = await this.characterReleaseRepo.findByCharacterAndRelease(inputDto.character_id, inputDto.release_id);
      if (existing) throw new CharacterReleaseV1AlreadyAssignedError(`Release "${inputDto.release_id}" is already assigned to character "${inputDto.character_id}"`);
      log.steps.push({ message: 'Verified assignment is unique.' });

      const dto = new CharacterReleaseV1Entity({
        characterReleaseInputData: {
          _id: randomUUID(),
          character_id: inputDto.character_id,
          release_id: inputDto.release_id,
          created_at: new Date().toISOString(),
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated CharacterReleaseV1Entity.' });

      const saved = await this.characterReleaseRepo.save(dto);
      log.steps.push({ message: `CharacterRelease persisted with id ${saved._id}.` });

      logInfo(`CharacterRelease assigned: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while assigning CharacterReleaseV1.' });
      logError('Error assigning CharacterReleaseV1', log);
      throw err;
    }
  }
}
