import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { ClanV1DatabaseRepository } from '../../database-repository';
import { IListClansV1UseCaseOutputDto } from './types';

export class ListClansV1UseCase {
  constructor(private readonly clanRepository: ClanV1DatabaseRepository) {}

  async execute(): Promise<IListClansV1UseCaseOutputDto> {
    const log: ILog = { module: ListClansV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const clans = await this.clanRepository.findAll();
      log.steps.push({ message: `Retrieved ${clans.length} clans.` });

      logInfo('Clans listed.', log);
      return clans;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing ClansV1.' });
      logError('Error listing ClansV1', log);
      throw err;
    }
  }
}
