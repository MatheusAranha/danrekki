import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLearningProgressV1DatabaseRepository } from '../../database-repository';
import { LearningProgressV1NotFoundError } from '../../errors';
import { IGetCharacterLearningProgressV1UseCaseInputDto, IGetCharacterLearningProgressV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetCharacterLearningProgressV1UseCase {
  constructor(private readonly progressRepo: CharacterLearningProgressV1DatabaseRepository) {}

  async execute(inputDto: IGetCharacterLearningProgressV1UseCaseInputDto): Promise<IGetCharacterLearningProgressV1UseCaseOutputDto> {
    const log: ILog = { module: GetCharacterLearningProgressV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const progress = await this.progressRepo.findById(inputDto.id);
      if (!progress) throw new LearningProgressV1NotFoundError(`LearningProgress with id "${inputDto.id}" not found`);
      log.steps.push({ message: `LearningProgress ${inputDto.id} retrieved.` });

      logInfo(`LearningProgress retrieved: ${progress._id}`, log);
      return progress;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving CharacterLearningProgressV1.' });
      logError('Error retrieving CharacterLearningProgressV1', log);
      throw err;
    }
  }
}
