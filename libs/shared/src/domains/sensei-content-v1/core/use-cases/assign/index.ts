import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiContentV1DatabaseRepository } from '../../database-repository';
import { SenseiContentV1Entity } from '../../entity';
import { SenseiContentV1AlreadyAssignedError } from '../../errors';
import { SenseiV1DatabaseRepository } from '../../../../sensei-v1/core/database-repository';
import { SenseiV1NotFoundError } from '../../../../sensei-v1/core/errors';
import { TrainableContentV1DatabaseRepository } from '../../../../trainable-content-v1/core/database-repository';
import { TrainableContentV1NotFoundError } from '../../../../trainable-content-v1/core/errors';
import { IAssignSenseiContentV1UseCaseInputDto, IAssignSenseiContentV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['sensei_id', 'trainable_content_id', 'required_proximity'],
  additionalProperties: false,
  properties: {
    sensei_id: { type: 'string', minLength: 1 },
    trainable_content_id: { type: 'string', minLength: 1 },
    required_proximity: { type: 'number', minimum: 1 },
  },
};

export class AssignSenseiContentV1UseCase {
  constructor(
    private readonly senseiContentRepo: SenseiContentV1DatabaseRepository,
    private readonly senseiRepo: SenseiV1DatabaseRepository,
    private readonly contentRepo: TrainableContentV1DatabaseRepository,
  ) {}

  async execute(inputDto: IAssignSenseiContentV1UseCaseInputDto): Promise<IAssignSenseiContentV1UseCaseOutputDto> {
    const log: ILog = { module: AssignSenseiContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      const sensei = await this.senseiRepo.findById(inputDto.sensei_id);
      if (!sensei) throw new SenseiV1NotFoundError(`Sensei with id "${inputDto.sensei_id}" not found`);
      log.steps.push({ message: `Sensei ${inputDto.sensei_id} found.` });

      const content = await this.contentRepo.findById(inputDto.trainable_content_id);
      if (!content) throw new TrainableContentV1NotFoundError(`TrainableContent with id "${inputDto.trainable_content_id}" not found`);
      log.steps.push({ message: `TrainableContent ${inputDto.trainable_content_id} found.` });

      const existing = await this.senseiContentRepo.findBySenseiAndContent(inputDto.sensei_id, inputDto.trainable_content_id);
      if (existing) throw new SenseiContentV1AlreadyAssignedError(`TrainableContent "${inputDto.trainable_content_id}" is already assigned to sensei "${inputDto.sensei_id}"`);
      log.steps.push({ message: 'Verified assignment is unique.' });

      const now = new Date().toISOString();
      const dto = new SenseiContentV1Entity({
        senseiContentInputData: {
          _id: randomUUID(),
          sensei_id: inputDto.sensei_id,
          trainable_content_id: inputDto.trainable_content_id,
          required_proximity: inputDto.required_proximity,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated SenseiContentV1Entity.' });

      const saved = await this.senseiContentRepo.save(dto);
      log.steps.push({ message: `SenseiContent persisted with id ${saved._id}.` });

      logInfo(`SenseiContent assigned: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while assigning SenseiContentV1.' });
      logError('Error assigning SenseiContentV1', log);
      throw err;
    }
  }
}
