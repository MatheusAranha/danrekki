import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { TrainableContentV1DatabaseRepository } from '../../database-repository';
import { TrainableContentV1NotFoundError } from '../../errors';
import { updateTrainableContentV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateTrainableContentV1UseCaseInputDto, IUpdateTrainableContentV1UseCaseOutputDto } from './types';

export class UpdateTrainableContentV1UseCase {
  constructor(private readonly contentRepo: TrainableContentV1DatabaseRepository) {}

  async execute(inputDto: IUpdateTrainableContentV1UseCaseInputDto): Promise<IUpdateTrainableContentV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateTrainableContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateTrainableContentV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.contentRepo.findById(inputDto.id);
      if (!existing) throw new TrainableContentV1NotFoundError(`TrainableContent with id "${inputDto.id}" not found`);
      log.steps.push({ message: `TrainableContent ${inputDto.id} found.` });

      const updated = await this.contentRepo.update(inputDto.id, {
        ...(inputDto.name !== undefined && { name: inputDto.name }),
        ...(inputDto.description !== undefined && { description: inputDto.description }),
        ...(inputDto.base_dt_cost !== undefined && { base_dt_cost: inputDto.base_dt_cost }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `TrainableContent ${inputDto.id} updated.` });

      logInfo(`TrainableContent updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating TrainableContentV1.' });
      logError('Error updating TrainableContentV1', log);
      throw err;
    }
  }
}
