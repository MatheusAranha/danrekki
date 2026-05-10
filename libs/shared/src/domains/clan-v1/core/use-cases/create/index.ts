import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ClanV1Entity } from '../../entity';
import { ClanV1DatabaseRepository } from '../../database-repository';
import { ClanV1NameAlreadyExistsError } from '../../errors';
import { createClanV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateClanV1UseCaseInputDto, ICreateClanV1UseCaseOutputDto } from './types';

export class CreateClanV1UseCase {
  constructor(private readonly clanRepository: ClanV1DatabaseRepository) {}

  async execute(inputDto: ICreateClanV1UseCaseInputDto): Promise<ICreateClanV1UseCaseOutputDto> {
    const log: ILog = { module: CreateClanV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createClanV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const existing = await this.clanRepository.findByName(inputDto.name);
      if (existing) throw new ClanV1NameAlreadyExistsError(`Clan name "${inputDto.name}" already exists`);
      log.steps.push({ message: 'Verified name is unique.' });

      const now = new Date().toISOString();
      const dto = new ClanV1Entity({
        clanInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          dt_modifiers: inputDto.dt_modifiers ?? [],
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated ClanV1Entity.' });

      const saved = await this.clanRepository.save(dto);
      log.steps.push({ message: `Clan "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`Clan created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating ClanV1.' });
      logError('Error creating ClanV1', log);
      throw err;
    }
  }
}
