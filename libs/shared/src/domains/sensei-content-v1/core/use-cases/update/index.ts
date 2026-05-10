import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiContentV1DatabaseRepository } from '../../database-repository';
import { SenseiContentV1NotFoundError } from '../../errors';
import { IUpdateSenseiContentV1UseCaseInputDto, IUpdateSenseiContentV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id', 'required_proximity'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', minLength: 1 },
    required_proximity: { type: 'number', minimum: 1 },
  },
};

export class UpdateSenseiContentV1UseCase {
  constructor(private readonly senseiContentRepo: SenseiContentV1DatabaseRepository) {}

  async execute(inputDto: IUpdateSenseiContentV1UseCaseInputDto): Promise<IUpdateSenseiContentV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateSenseiContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.senseiContentRepo.findById(inputDto.id);
      if (!existing) throw new SenseiContentV1NotFoundError(`SenseiContent with id "${inputDto.id}" not found`);
      log.steps.push({ message: `SenseiContent ${inputDto.id} found.` });

      const updated = await this.senseiContentRepo.update(inputDto.id, {
        required_proximity: inputDto.required_proximity,
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `SenseiContent ${inputDto.id} updated.` });

      logInfo(`SenseiContent updated: ${inputDto.id}`, log);
      return updated!;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating SenseiContentV1.' });
      logError('Error updating SenseiContentV1', log);
      throw err;
    }
  }
}
