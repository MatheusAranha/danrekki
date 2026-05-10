import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { UserV1DatabaseRepository } from '../../database-repository';
import { UserV1NotFoundError } from '../../errors';
import { IDeleteUserV1UseCaseInputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class DeleteUserV1UseCase {
  constructor(private readonly userRepository: UserV1DatabaseRepository) {}

  async execute(inputDto: IDeleteUserV1UseCaseInputDto): Promise<void> {
    const log: ILog = { module: DeleteUserV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.userRepository.findById(inputDto.id);
      if (!existing) throw new UserV1NotFoundError(`User with id "${inputDto.id}" not found`);
      log.steps.push({ message: `User ${inputDto.id} found.` });

      await this.userRepository.delete(inputDto.id);
      log.steps.push({ message: `User ${inputDto.id} deleted.` });

      logInfo(`User deleted: ${inputDto.id}`, log);
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while deleting UserV1.' });
      logError('Error deleting UserV1', log);
      throw err;
    }
  }
}
