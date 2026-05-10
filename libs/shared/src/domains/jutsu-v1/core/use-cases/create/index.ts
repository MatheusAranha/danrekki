import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuV1Entity } from '../../entity';
import { JutsuV1DatabaseRepository } from '../../database-repository';
import { JutsuV1NameAlreadyExistsError } from '../../errors';
import { createJutsuV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateJutsuV1UseCaseInputDto, ICreateJutsuV1UseCaseOutputDto } from './types';

export class CreateJutsuV1UseCase {
  constructor(private readonly jutsuRepository: JutsuV1DatabaseRepository) {}

  async execute(inputDto: ICreateJutsuV1UseCaseInputDto): Promise<ICreateJutsuV1UseCaseOutputDto> {
    const log: ILog = { module: CreateJutsuV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createJutsuV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.jutsuRepository.findByName(inputDto.name);
      if (existing) throw new JutsuV1NameAlreadyExistsError(`Jutsu name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new JutsuV1Entity({
        jutsuInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          jutsu_rank_id: inputDto.jutsu_rank_id,
          release_id: inputDto.release_id,
          components: inputDto.components,
          duration: inputDto.duration,
          description: inputDto.description,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated JutsuV1Entity.' });

      const saved = await this.jutsuRepository.save(dto);
      log.steps.push({ message: `Jutsu "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`Jutsu created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating JutsuV1.' });
      logError('Error creating JutsuV1', log);
      throw err;
    }
  }
}
