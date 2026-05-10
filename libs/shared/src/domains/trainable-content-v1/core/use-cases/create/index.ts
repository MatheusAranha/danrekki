import { randomUUID } from 'crypto';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { TrainableContentV1Entity } from '../../entity';
import { TrainableContentV1DatabaseRepository } from '../../database-repository';
import { JutsuV1DatabaseRepository } from '../../../../jutsu-v1/core/database-repository';
import { JutsuV1NotFoundError } from '../../../../jutsu-v1/core/errors';
import { createTrainableContentV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateTrainableContentV1UseCaseInputDto, ICreateTrainableContentV1UseCaseOutputDto } from './types';

export class CreateTrainableContentV1UseCase {
  constructor(
    private readonly contentRepo: TrainableContentV1DatabaseRepository,
    private readonly jutsuRepo: JutsuV1DatabaseRepository,
  ) {}

  async execute(inputDto: ICreateTrainableContentV1UseCaseInputDto): Promise<ICreateTrainableContentV1UseCaseOutputDto> {
    const log: ILog = { module: CreateTrainableContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createTrainableContentV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: inputDto });

      let jutsu_id: string | null = null;

      if (inputDto.type === 'jutsu') {
        const jutsuId = inputDto.jutsu_id as string;
        const jutsu = await this.jutsuRepo.findById(jutsuId);
        if (!jutsu) throw new JutsuV1NotFoundError(`Jutsu with id "${jutsuId}" not found`);
        log.steps.push({ message: `Jutsu ${jutsuId} found.` });
        jutsu_id = jutsuId;
      }

      const now = new Date().toISOString();
      const dto = new TrainableContentV1Entity({
        contentInputData: {
          _id: randomUUID(),
          type: inputDto.type,
          jutsu_id,
          name: inputDto.name,
          description: inputDto.description,
          base_dt_cost: inputDto.base_dt_cost,
          created_at: now,
          updated_at: now,
        },
      }).validate().getDto();
      log.steps.push({ message: 'Built and validated TrainableContentV1Entity.' });

      const saved = await this.contentRepo.save(dto);
      log.steps.push({ message: `TrainableContent "${saved.name}" persisted with id ${saved._id}.` });

      logInfo(`TrainableContent created: ${saved._id}`, log);
      return saved;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating TrainableContentV1.' });
      logError('Error creating TrainableContentV1', log);
      throw err;
    }
  }
}
