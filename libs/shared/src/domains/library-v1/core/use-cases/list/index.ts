import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { LibraryV1DatabaseRepository } from '../../database-repository';
import { IListLibrariesV1UseCaseOutputDto } from './types';

export class ListLibrariesV1UseCase {
  constructor(private readonly libraryRepository: LibraryV1DatabaseRepository) {}

  async execute(): Promise<IListLibrariesV1UseCaseOutputDto> {
    const log: ILog = { module: ListLibrariesV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const libraries = await this.libraryRepository.findAll();
      log.steps.push({ message: `Retrieved ${libraries.length} libraries.` });

      logInfo('Libraries listed.', log);
      return libraries;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing LibrariesV1.' });
      logError('Error listing LibrariesV1', log);
      throw err;
    }
  }
}
