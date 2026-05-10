import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryV1Entity } from '../../entity';
import { LibraryV1DatabaseRepository } from '../../database-repository';
import { LibraryV1NameAlreadyExistsError } from '../../errors';
import { createLibraryV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateLibraryV1UseCaseInputDto, ICreateLibraryV1UseCaseOutputDto } from './types';

export class CreateLibraryV1UseCase {
  constructor(private readonly libraryRepository: LibraryV1DatabaseRepository) {}

  async execute(inputDto: ICreateLibraryV1UseCaseInputDto): Promise<ICreateLibraryV1UseCaseOutputDto> {
    const log: ILog = { module: CreateLibraryV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createLibraryV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.libraryRepository.findByName(inputDto.name);
      if (existing) throw new LibraryV1NameAlreadyExistsError(`Library name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new LibraryV1Entity({
        libraryInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          description: inputDto.description,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated LibraryV1Entity.' });

      const saved = await this.libraryRepository.save(dto);
      log.steps.push({ message: `Library "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`Library created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating LibraryV1.' });
      logError('Error creating LibraryV1', log);
      throw err;
    }
  }
}
