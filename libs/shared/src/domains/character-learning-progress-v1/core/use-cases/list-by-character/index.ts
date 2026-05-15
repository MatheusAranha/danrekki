import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterLearningProgressV1DatabaseRepository } from '../../database-repository';
import { IListByCharacterLearningProgressV1UseCaseInputDto, IListByCharacterLearningProgressV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['character_id'],
  additionalProperties: false,
  properties: { character_id: { type: 'string', minLength: 1 } },
};

export class ListByCharacterLearningProgressV1UseCase {
  constructor(private readonly progressRepo: CharacterLearningProgressV1DatabaseRepository) {}

  async execute(inputDto: IListByCharacterLearningProgressV1UseCaseInputDto): Promise<IListByCharacterLearningProgressV1UseCaseOutputDto> {
    const log: ILog = { module: ListByCharacterLearningProgressV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const progressList = await this.progressRepo.findByCharacterId(inputDto.character_id);
      log.steps.push({ message: `Retrieved ${progressList.length} learning progress record(s) for character ${inputDto.character_id}.` });

      logInfo(`LearningProgress listed for character: ${inputDto.character_id}`, log);
      return progressList;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing CharacterLearningProgressV1 by character.' });
      logError('Error listing CharacterLearningProgressV1 by character', log);
      throw err;
    }
  }
}
