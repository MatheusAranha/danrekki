import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { UserV1Entity } from '../../entity';
import { UserV1DatabaseRepository } from '../../database-repository';
import { UserV1NotFoundError, UserV1EmailAlreadyExistsError } from '../../errors';
import { updateUserV1InputDtoJsonSchema } from './input-dto.schema';
import { IUpdateUserV1UseCaseInputDto, IUpdateUserV1UseCaseOutputDto } from './types';

export class UpdateUserV1UseCase {
  constructor(private readonly userRepository: UserV1DatabaseRepository) {}

  async execute(inputDto: IUpdateUserV1UseCaseInputDto): Promise<IUpdateUserV1UseCaseOutputDto> {
    const log: ILog = { module: UpdateUserV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(updateUserV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const existing = await this.userRepository.findById(inputDto.id);
      if (!existing) throw new UserV1NotFoundError(`User with id "${inputDto.id}" not found`);
      log.steps.push({ message: `User ${inputDto.id} found.` });

      if (inputDto.email && inputDto.email !== existing.email) {
        const emailConflict = await this.userRepository.findByEmail(inputDto.email);
        if (emailConflict) throw new UserV1EmailAlreadyExistsError(`Email "${inputDto.email}" already exists`);
        log.steps.push({ message: 'Verified updated email is unique.' });
      }

      const updated = await this.userRepository.update(inputDto.id, {
        ...(inputDto.email !== undefined && { email: inputDto.email }),
        ...(inputDto.role !== undefined && { role: inputDto.role }),
        updated_at: new Date().toISOString(),
      });
      log.steps.push({ message: `User ${inputDto.id} updated.` });

      const result = new UserV1Entity({ userInputData: updated! }).toPublicDto();
      logInfo(`User updated: ${inputDto.id}`, log);
      return result;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while updating UserV1.' });
      logError('Error updating UserV1', log);
      throw err;
    }
  }
}
