import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterV1Entity } from '../../entity';
import { CharacterV1DatabaseRepository } from '../../database-repository';
import { createCharacterV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateCharacterV1UseCaseInputDto, ICreateCharacterV1UseCaseOutputDto } from './types';

export class CreateCharacterV1UseCase {
  constructor(private readonly characterRepository: CharacterV1DatabaseRepository) {}

  async execute(inputDto: ICreateCharacterV1UseCaseInputDto): Promise<ICreateCharacterV1UseCaseOutputDto> {
    const log: ILog = { module: CreateCharacterV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createCharacterV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const now = new Date().toISOString();
      const dto = new CharacterV1Entity({
        characterInputData: {
          _id: randomUUID(),
          name: inputDto.name,
          user_id: inputDto.user_id,
          clan_id: inputDto.clan_id,
          available_dt: 0,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated CharacterV1Entity.' });

      const saved = await this.characterRepository.save(dto);
      log.steps.push({ message: `Character "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`Character created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating CharacterV1.' });
      logError('Error creating CharacterV1', log);
      throw err;
    }
  }
}
