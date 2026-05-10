import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { NinjaRankV1Entity } from '../../entity';
import { NinjaRankV1DatabaseRepository } from '../../database-repository';
import { NinjaRankV1NameAlreadyExistsError } from '../../errors';
import { createNinjaRankV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateNinjaRankV1UseCaseInputDto, ICreateNinjaRankV1UseCaseOutputDto } from './types';

export class CreateNinjaRankV1UseCase {
  constructor(private readonly ninjaRankRepository: NinjaRankV1DatabaseRepository) {}

  async execute(inputDto: ICreateNinjaRankV1UseCaseInputDto): Promise<ICreateNinjaRankV1UseCaseOutputDto> {
    const log: ILog = { module: CreateNinjaRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createNinjaRankV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.ninjaRankRepository.findByName(inputDto.name);
      if (existing) throw new NinjaRankV1NameAlreadyExistsError(`NinjaRank name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new NinjaRankV1Entity({
        ninjaRankInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          order: inputDto.order,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated NinjaRankV1Entity.' });

      const saved = await this.ninjaRankRepository.save(dto);
      log.steps.push({ message: `NinjaRank "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`NinjaRank created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating NinjaRankV1.' });
      logError('Error creating NinjaRankV1', log);
      throw err;
    }
  }
}
