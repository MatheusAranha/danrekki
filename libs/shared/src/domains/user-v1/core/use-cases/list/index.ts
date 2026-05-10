import { ILog } from '../../../../../_shared/types';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { UserV1Entity } from '../../entity';
import { UserV1DatabaseRepository } from '../../database-repository';
import { IListUsersV1UseCaseOutputDto } from './types';

export class ListUsersV1UseCase {
  constructor(private readonly userRepository: UserV1DatabaseRepository) {}

  async execute(): Promise<IListUsersV1UseCaseOutputDto> {
    const log: ILog = { module: ListUsersV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      const users = await this.userRepository.findAll();
      log.steps.push({ message: `Retrieved ${users.length} users.` });

      const result = users.map((u) => new UserV1Entity({ userInputData: u }).toPublicDto());
      logInfo('Users listed.', log);
      return result;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while listing UsersV1.' });
      logError('Error listing UsersV1', log);
      throw err;
    }
  }
}
