import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { UserV1Entity } from '../../entity';
import { UserV1DatabaseRepository } from '../../database-repository';
import { UserV1EmailAlreadyExistsError } from '../../errors';
import { createUserV1InputDtoJsonSchema } from './input-dto.schema';
import { ICreateUserV1UseCaseInputDto, ICreateUserV1UseCaseOutputDto } from './types';

export class CreateUserV1UseCase {
  constructor(private readonly userRepository: UserV1DatabaseRepository) {}

  async execute(inputDto: ICreateUserV1UseCaseInputDto): Promise<ICreateUserV1UseCaseOutputDto> {
    const log: ILog = { module: CreateUserV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(createUserV1InputDtoJsonSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.', data: { email: inputDto.email, role: inputDto.role } });

      const existing = await this.userRepository.findByEmail(inputDto.email);
      if (existing) throw new UserV1EmailAlreadyExistsError(`Email "${inputDto.email}" already exists`);
      log.steps.push({ message: 'Verified email is unique.' });

      const password_hash = await bcrypt.hash(inputDto.password, 10);
      log.steps.push({ message: 'Password hashed.' });

      const now = new Date().toISOString();
      const entity = new UserV1Entity({
        userInputData: {
          _id: randomUUID(),
          email: inputDto.email,
          password_hash,
          role: inputDto.role,
          created_at: now,
          updated_at: now,
        },
      }).validate();
      log.steps.push({ message: 'Built and validated UserV1Entity.' });

      const saved = await this.userRepository.save(entity.getDto());
      log.steps.push({ message: `User "${saved.email}" persisted with id ${saved._id}.` });

      const result = new UserV1Entity({ userInputData: saved }).toPublicDto();
      logInfo(`User created: ${saved._id}`, log);
      return result;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while creating UserV1.' });
      logError('Error creating UserV1', log);
      throw err;
    }
  }
}
