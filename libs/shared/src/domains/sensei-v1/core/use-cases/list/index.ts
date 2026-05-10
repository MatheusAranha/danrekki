import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { SenseiV1DatabaseRepository } from '../../database-repository';
import { IListSenseiV1UseCaseOutputDto } from './types';

export class ListSenseiV1UseCase {
  constructor(private readonly senseiRepository: SenseiV1DatabaseRepository) {}

  async execute(): Promise<IListSenseiV1UseCaseOutputDto> {
    const log: ILog = { module: ListSenseiV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const senseis = await this.senseiRepository.findAll();
      log.steps.push({ message: `Retrieved ${senseis.length} senseis.` });

      logInfo('Senseis listed.', log);
      return senseis;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing SenseiV1.' });
      logError('Error listing SenseiV1', log);
      throw err;
    }
  }
}
