import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { NinjaRankV1DatabaseRepository } from '../../database-repository';
import { IListNinjaRanksV1UseCaseOutputDto } from './types';

export class ListNinjaRanksV1UseCase {
  constructor(private readonly ninjaRankRepository: NinjaRankV1DatabaseRepository) {}

  async execute(): Promise<IListNinjaRanksV1UseCaseOutputDto> {
    const log: ILog = { module: ListNinjaRanksV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const ninjaRanks = await this.ninjaRankRepository.findAll();
      log.steps.push({ message: `Retrieved ${ninjaRanks.length} ninja ranks.` });

      logInfo('NinjaRanks listed.', log);
      return ninjaRanks;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing NinjaRanksV1.' });
      logError('Error listing NinjaRanksV1', log);
      throw err;
    }
  }
}
