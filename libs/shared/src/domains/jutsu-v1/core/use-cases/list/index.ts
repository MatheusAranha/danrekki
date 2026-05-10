import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { JutsuV1DatabaseRepository } from '../../database-repository';
import { IListJutsusV1UseCaseOutputDto } from './types';

export class ListJutsusV1UseCase {
  constructor(private readonly jutsuRepository: JutsuV1DatabaseRepository) {}

  async execute(): Promise<IListJutsusV1UseCaseOutputDto> {
    const log: ILog = { module: ListJutsusV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const jutsus = await this.jutsuRepository.findAll();
      log.steps.push({ message: `Retrieved ${jutsus.length} jutsus.` });

      logInfo('Jutsus listed.', log);
      return jutsus;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing JutsusV1.' });
      logError('Error listing JutsusV1', log);
      throw err;
    }
  }
}
