import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLibraryV1DatabaseRepository } from '../../database-repository';
import { CharacterLibraryV1Entity } from '../../entity';
import { CharacterLibraryV1AlreadyAssignedError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { LibraryV1DatabaseRepository } from '../../../../library-v1/core/database-repository';
import { LibraryV1NotFoundError } from '../../../../library-v1/core/errors';
import { NinjaRankV1DatabaseRepository } from '../../../../ninja-rank-v1/core/database-repository';
import { NinjaRankV1NotFoundError } from '../../../../ninja-rank-v1/core/errors';
import { IAssignCharacterLibraryV1UseCaseInputDto, IAssignCharacterLibraryV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id', 'library_id', 'required_ninja_rank_id'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    library_id: { type: 'string', minLength: 1 },
    required_ninja_rank_id: { type: 'string', minLength: 1 },
  },
};

export class AssignCharacterLibraryV1UseCase {
  constructor(
    private readonly characterLibraryRepo: CharacterLibraryV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly libraryRepo: LibraryV1DatabaseRepository,
    private readonly ninjaRankRepo: NinjaRankV1DatabaseRepository,
  ) {}

  async execute(inputDto: IAssignCharacterLibraryV1UseCaseInputDto): Promise<IAssignCharacterLibraryV1UseCaseOutputDto> {
    const log: ILog = { module: AssignCharacterLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const library = await this.libraryRepo.findById(inputDto.library_id);
      if (!library) throw new LibraryV1NotFoundError(`Library with id "${inputDto.library_id}" not found`);
      log.steps.push({ message: `Library ${inputDto.library_id} found.` });

      const ninjaRank = await this.ninjaRankRepo.findById(inputDto.required_ninja_rank_id);
      if (!ninjaRank) throw new NinjaRankV1NotFoundError(`NinjaRank with id "${inputDto.required_ninja_rank_id}" not found`);
      log.steps.push({ message: `NinjaRank ${inputDto.required_ninja_rank_id} found.` });

      const existing = await this.characterLibraryRepo.findByCharacterAndLibrary(inputDto.character_id, inputDto.library_id);
      if (existing) throw new CharacterLibraryV1AlreadyAssignedError(`Library "${inputDto.library_id}" is already assigned to character "${inputDto.character_id}"`);
      log.steps.push({ message: 'Verified assignment is unique.' });

      const now = new Date().toISOString();
      const dto = new CharacterLibraryV1Entity({
        characterLibraryInputData: {
          _id: randomUUID(),
          character_id: inputDto.character_id,
          library_id: inputDto.library_id,
          required_ninja_rank_id: inputDto.required_ninja_rank_id,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated CharacterLibraryV1Entity.' });

      const saved = await this.characterLibraryRepo.save(dto);
      log.steps.push({ message: `CharacterLibrary persisted with id ${saved._id}.` });

      logInfo(`CharacterLibrary assigned: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while assigning CharacterLibraryV1.' });
      logError('Error assigning CharacterLibraryV1', log);
      throw err;
    }
  }
}
