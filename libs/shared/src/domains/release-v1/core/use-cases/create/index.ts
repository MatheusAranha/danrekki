import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ReleaseV1Entity } from '../../entity';
import { ReleaseV1DatabaseRepository } from '../../database-repository';
import { ReleaseV1NameAlreadyExistsError } from '../../errors';
import { createReleaseV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateReleaseV1UseCaseInputDto, ICreateReleaseV1UseCaseOutputDto } from './types';

export class CreateReleaseV1UseCase {
  constructor(private readonly releaseRepository: ReleaseV1DatabaseRepository) {}

  async execute(inputDto: ICreateReleaseV1UseCaseInputDto): Promise<ICreateReleaseV1UseCaseOutputDto> {
    const log: ILog = { module: CreateReleaseV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createReleaseV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.releaseRepository.findByName(inputDto.name);
      if (existing) throw new ReleaseV1NameAlreadyExistsError(`Release name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new ReleaseV1Entity({
        releaseInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated ReleaseV1Entity.' });

      const saved = await this.releaseRepository.save(dto);
      log.steps.push({ message: `Release "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`Release created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating ReleaseV1.' });
      logError('Error creating ReleaseV1', log);
      throw err;
    }
  }
}
