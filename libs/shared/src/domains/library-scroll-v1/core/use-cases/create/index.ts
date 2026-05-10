import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryScrollV1Entity } from '../../entity';
import { LibraryScrollV1DatabaseRepository } from '../../database-repository';
import { LibraryV1DatabaseRepository } from '../../../../library-v1/core/database-repository';
import { LibraryV1NotFoundError } from '../../../../library-v1/core/errors';
import { JutsuV1DatabaseRepository } from '../../../../jutsu-v1/core/database-repository';
import { JutsuV1NotFoundError } from '../../../../jutsu-v1/core/errors';
import { NinjaRankV1DatabaseRepository } from '../../../../ninja-rank-v1/core/database-repository';
import { NinjaRankV1NotFoundError } from '../../../../ninja-rank-v1/core/errors';
import { ICreateLibraryScrollV1UseCaseInputDto, ICreateLibraryScrollV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['library_id', 'jutsu_id', 'required_ninja_rank_id'],
  additionalProperties: false,
  properties: {
    library_id: { type: 'string', minLength: 1 },
    jutsu_id: { type: 'string', minLength: 1 },
    required_ninja_rank_id: { type: 'string', minLength: 1 },
  },
};

export class CreateLibraryScrollV1UseCase {
  constructor(
    private readonly scrollRepo: LibraryScrollV1DatabaseRepository,
    private readonly libraryRepo: LibraryV1DatabaseRepository,
    private readonly jutsuRepo: JutsuV1DatabaseRepository,
    private readonly ninjaRankRepo: NinjaRankV1DatabaseRepository,
  ) {}

  async execute(inputDto: ICreateLibraryScrollV1UseCaseInputDto): Promise<ICreateLibraryScrollV1UseCaseOutputDto> {
    const log: ILog = { module: CreateLibraryScrollV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const library = await this.libraryRepo.findById(inputDto.library_id);
      if (!library) throw new LibraryV1NotFoundError(`Library with id "${inputDto.library_id}" not found`);
      log.steps.push({ message: `Library ${inputDto.library_id} found.` });

      const jutsu = await this.jutsuRepo.findById(inputDto.jutsu_id);
      if (!jutsu) throw new JutsuV1NotFoundError(`Jutsu with id "${inputDto.jutsu_id}" not found`);
      log.steps.push({ message: `Jutsu ${inputDto.jutsu_id} found.` });

      const ninjaRank = await this.ninjaRankRepo.findById(inputDto.required_ninja_rank_id);
      if (!ninjaRank) throw new NinjaRankV1NotFoundError(`NinjaRank with id "${inputDto.required_ninja_rank_id}" not found`);
      log.steps.push({ message: `NinjaRank ${inputDto.required_ninja_rank_id} found.` });

      const now = new Date().toISOString();
      const dto = new LibraryScrollV1Entity({
        scrollInputData: {
          _id: randomUUID(),
          library_id: inputDto.library_id,
          jutsu_id: inputDto.jutsu_id,
          required_ninja_rank_id: inputDto.required_ninja_rank_id,
          rented_by_character_id: null,
          rented_at: null,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated LibraryScrollV1Entity.' });

      const saved = await this.scrollRepo.save(dto);
      log.steps.push({ message: `LibraryScroll persisted with id ${saved._id}.` });

      logInfo(`LibraryScroll created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating LibraryScrollV1.' });
      logError('Error creating LibraryScrollV1', log);
      throw err;
    }
  }
}
