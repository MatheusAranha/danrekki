import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { KeywordV1DatabaseRepository } from '../../database-repository';
import { IListKeywordsV1UseCaseOutputDto } from './types';

export class ListKeywordsV1UseCase {
  constructor(private readonly keywordRepository: KeywordV1DatabaseRepository) {}

  async execute(): Promise<IListKeywordsV1UseCaseOutputDto> {
    const log: ILog = { module: ListKeywordsV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const releases = await this.keywordRepository.findAll();
      log.steps.push({ message: `Retrieved ${releases.length} keywords.` });

      logInfo('Keywords listed.', log);
      return releases;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing KeywordsV1.' });
      logError('Error listing KeywordsV1', log);
      throw err;
    }
  }
}
