import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { UserV1Entity } from '../../entity';
import { UserV1DatabaseRepository } from '../../database-repository';
import { UserV1NotFoundError } from '../../errors';
import { IGetUserV1UseCaseInputDto, IGetUserV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1 } },
};

export class GetUserV1UseCase {
  constructor(private readonly userRepository: UserV1DatabaseRepository) {}

  async execute(inputDto: IGetUserV1UseCaseInputDto): Promise<IGetUserV1UseCaseOutputDto> {
    const log: ILog = { module: GetUserV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const user = await this.userRepository.findById(inputDto.id);
      if (!user) throw new UserV1NotFoundError(`User with id "${inputDto.id}" not found`);
      log.steps.push({ message: `User ${inputDto.id} retrieved.` });

      const result = new UserV1Entity({ userInputData: user }).toPublicDto();
      logInfo(`User retrieved: ${user._id}`, log);
      return result;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while retrieving UserV1.' });
      logError('Error retrieving UserV1', log);
      throw err;
    }
  }
}
