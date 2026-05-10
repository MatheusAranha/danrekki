import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { TrainableContentV1DatabaseRepository } from '../../database-repository';
import { IListTrainableContentV1UseCaseOutputDto } from './types';

export class ListTrainableContentV1UseCase {
  constructor(private readonly contentRepo: TrainableContentV1DatabaseRepository) {}

  async execute(): Promise<IListTrainableContentV1UseCaseOutputDto> {
    const log: ILog = { module: ListTrainableContentV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const contents = await this.contentRepo.findAll();
      log.steps.push({ message: `Retrieved ${contents.length} trainable contents.` });

      logInfo('TrainableContents listed.', log);
      return contents;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing TrainableContentV1.' });
      logError('Error listing TrainableContentV1', log);
      throw err;
    }
  }
}
