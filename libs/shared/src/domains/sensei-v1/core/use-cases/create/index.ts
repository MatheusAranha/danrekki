import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiV1Entity } from '../../entity';
import { SenseiV1DatabaseRepository } from '../../database-repository';
import { SenseiV1NameAlreadyExistsError } from '../../errors';
import { createSenseiV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateSenseiV1UseCaseInputDto, ICreateSenseiV1UseCaseOutputDto } from './types';

export class CreateSenseiV1UseCase {
  constructor(private readonly senseiRepository: SenseiV1DatabaseRepository) {}

  async execute(inputDto: ICreateSenseiV1UseCaseInputDto): Promise<ICreateSenseiV1UseCaseOutputDto> {
    const log: ILog = { module: CreateSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createSenseiV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.senseiRepository.findByName(inputDto.name);
      if (existing) throw new SenseiV1NameAlreadyExistsError(`Sensei name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new SenseiV1Entity({
        senseiInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          description: inputDto.description,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated SenseiV1Entity.' });

      const saved = await this.senseiRepository.save(dto);
      log.steps.push({ message: `Sensei "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`Sensei created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating SenseiV1.' });
      logError('Error creating SenseiV1', log);
      throw err;
    }
  }
}
