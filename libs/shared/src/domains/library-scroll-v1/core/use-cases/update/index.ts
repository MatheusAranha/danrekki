import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryScrollV1DatabaseRepository } from '../../database-repository';
import { LibraryScrollV1NotFoundError } from '../../errors';
import { IUpdateLibraryScrollV1UseCaseInputDto, IUpdateLibraryScrollV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    jutsu_id: { type: 'string', minLength: 1 },
    required_ninja_rank_id: { type: 'string', minLength: 1 },
  },
};

export class UpdateLibraryScrollV1UseCase {
  constructor(private readonly scrollRepo: LibraryScrollV1DatabaseRepository) {}

  async execute(inputDto: IUpdateLibraryScrollV1UseCaseInputDto): Promise<IUpdateLibraryScrollV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateLibraryScrollV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.scrollRepo.findById(inputDto.id);
      if (!existing) throw new LibraryScrollV1NotFoundError(`LibraryScroll with id "${inputDto.id}" not found`);
      log.steps.push({ message: `LibraryScroll ${inputDto.id} found.` });

      const updated = await this.scrollRepo.update(inputDto.id, {
        ...(inputDto.jutsu_id !== undefined && { jutsu_id: inputDto.jutsu_id }),
        ...(inputDto.required_ninja_rank_id !== undefined && { required_ninja_rank_id: inputDto.required_ninja_rank_id }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `LibraryScroll ${inputDto.id} updated.` });

      logInfo(`LibraryScroll updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating LibraryScrollV1.' });
      logError('Error updating LibraryScrollV1', log);
      throw err;
    }
  }
}
