import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterSenseiV1DatabaseRepository } from '../../database-repository';
import { CharacterSenseiV1Entity } from '../../entity';
import { CharacterSenseiV1AlreadyAssignedError } from '../../errors';
import { CharacterV1DatabaseRepository } from '../../../../character-v1/core/database-repository';
import { CharacterV1NotFoundError } from '../../../../character-v1/core/errors';
import { SenseiV1DatabaseRepository } from '../../../../sensei-v1/core/database-repository';
import { SenseiV1NotFoundError } from '../../../../sensei-v1/core/errors';
import { IAssignCharacterSenseiV1UseCaseInputDto, IAssignCharacterSenseiV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id', 'sensei_id', 'proximity'],
  additionalProperties: false,
  properties: {
    character_id: { type: 'string', minLength: 1 },
    sensei_id: { type: 'string', minLength: 1 },
    proximity: { type: 'number', minimum: 1, maximum: 10 },
  },
};

export class AssignCharacterSenseiV1UseCase {
  constructor(
    private readonly characterSenseiRepo: CharacterSenseiV1DatabaseRepository,
    private readonly characterRepo: CharacterV1DatabaseRepository,
    private readonly senseiRepo: SenseiV1DatabaseRepository,
  ) {}

  async execute(inputDto: IAssignCharacterSenseiV1UseCaseInputDto): Promise<IAssignCharacterSenseiV1UseCaseOutputDto> {
    const log: ILog = { module: AssignCharacterSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const character = await this.characterRepo.findById(inputDto.character_id);
      if (!character) throw new CharacterV1NotFoundError(`Character with id "${inputDto.character_id}" not found`);
      log.steps.push({ message: `Character ${inputDto.character_id} found.` });

      const sensei = await this.senseiRepo.findById(inputDto.sensei_id);
      if (!sensei) throw new SenseiV1NotFoundError(`Sensei with id "${inputDto.sensei_id}" not found`);
      log.steps.push({ message: `Sensei ${inputDto.sensei_id} found.` });

      const existing = await this.characterSenseiRepo.findByCharacterAndSensei(inputDto.character_id, inputDto.sensei_id);
      if (existing) throw new CharacterSenseiV1AlreadyAssignedError(`Sensei "${inputDto.sensei_id}" is already assigned to character "${inputDto.character_id}"`);
      log.steps.push({ message: 'Verified assignment is unique.' });

      const now = new Date().toISOString();
      const dto = new CharacterSenseiV1Entity({
        characterSenseiInputData: {
          _id: randomUUID(),
          character_id: inputDto.character_id,
          sensei_id: inputDto.sensei_id,
          proximity: inputDto.proximity,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated CharacterSenseiV1Entity.' });

      const saved = await this.characterSenseiRepo.save(dto);
      log.steps.push({ message: `CharacterSensei persisted with id ${saved._id}.` });

      logInfo(`CharacterSensei assigned: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while assigning CharacterSenseiV1.' });
      logError('Error assigning CharacterSenseiV1', log);
      throw err;
    }
  }
}
