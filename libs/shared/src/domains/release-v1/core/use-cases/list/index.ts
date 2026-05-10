import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ReleaseV1DatabaseRepository } from '../../database-repository';
import { IListReleasesV1UseCaseOutputDto } from './types';

export class ListReleasesV1UseCase {
  constructor(private readonly releaseRepository: ReleaseV1DatabaseRepository) {}

  async execute(): Promise<IListReleasesV1UseCaseOutputDto> {
    const log: ILog = { module: ListReleasesV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const releases = await this.releaseRepository.findAll();
      log.steps.push({ message: `Retrieved ${releases.length} releases.` });

      logInfo('Releases listed.', log);
      return releases;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing ReleasesV1.' });
      logError('Error listing ReleasesV1', log);
      throw err;
    }
  }
}
