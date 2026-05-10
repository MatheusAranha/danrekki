import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { CharacterV1DatabaseRepository } from '../../database-repository';
import { IListCharactersV1UseCaseOutputDto } from './types';

export class ListCharactersV1UseCase {
  constructor(private readonly characterRepository: CharacterV1DatabaseRepository) {}

  async execute(): Promise<IListCharactersV1UseCaseOutputDto> {
    const log: ILog = { module: ListCharactersV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const characters = await this.characterRepository.findAll();
      log.steps.push({ message: `Retrieved ${characters.length} characters.` });

      logInfo('Characters listed.', log);
      return characters;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing CharactersV1.' });
      logError('Error listing CharactersV1', log);
      throw err;
    }
  }
}
