import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuRankV1Entity } from '../../entity';
import { JutsuRankV1DatabaseRepository } from '../../database-repository';
import { JutsuRankV1NameAlreadyExistsError } from '../../errors';
import { createJutsuRankV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateJutsuRankV1UseCaseInputDto, ICreateJutsuRankV1UseCaseOutputDto } from './types';

export class CreateJutsuRankV1UseCase {
  constructor(private readonly jutsuRankRepository: JutsuRankV1DatabaseRepository) {}

  async execute(inputDto: ICreateJutsuRankV1UseCaseInputDto): Promise<ICreateJutsuRankV1UseCaseOutputDto> {
    const log: ILog = { module: CreateJutsuRankV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createJutsuRankV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.jutsuRankRepository.findByName(inputDto.name);
      if (existing) throw new JutsuRankV1NameAlreadyExistsError(`JutsuRank name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new JutsuRankV1Entity({
        jutsuRankInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          order: inputDto.order,
          dt_cost: inputDto.dt_cost,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated JutsuRankV1Entity.' });

      const saved = await this.jutsuRankRepository.save(dto);
      log.steps.push({ message: `JutsuRank "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`JutsuRank created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating JutsuRankV1.' });
      logError('Error creating JutsuRankV1', log);
      throw err;
    }
  }
}
