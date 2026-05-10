import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuRankV1DatabaseRepository } from '../../database-repository';
import { IListJutsuRanksV1UseCaseOutputDto } from './types';

export class ListJutsuRanksV1UseCase {
  constructor(private readonly jutsuRankRepository: JutsuRankV1DatabaseRepository) {}

  async execute(): Promise<IListJutsuRanksV1UseCaseOutputDto> {
    const log: ILog = { module: ListJutsuRanksV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const jutsuRanks = await this.jutsuRankRepository.findAll();
      log.steps.push({ message: `Retrieved ${jutsuRanks.length} jutsu ranks.` });

      logInfo('JutsuRanks listed.', log);
      return jutsuRanks;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing JutsuRanksV1.' });
      logError('Error listing JutsuRanksV1', log);
      throw err;
    }
  }
}
