import bcrypt from 'bcryptjs';
import { ILog } from '../../../../../_shared/types';
import { schemaValidator } from '../../../../../_shared/validators/json-schema-validator';
import { info as logInfo, error as logError } from '../../../../../_shared/logger';
import { TokenService } from '../../../../../_shared/auth/token-service';
import { UserV1Entity } from '../../entity';
import { UserV1DatabaseRepository } from '../../database-repository';
import { InvalidCredentialsError } from '../../errors';
import { ILoginUserV1UseCaseInputDto, ILoginUserV1UseCaseOutputDto } from './types';

const inputSchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
};

export class LoginUserV1UseCase {
  constructor(
    private readonly userRepository: UserV1DatabaseRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(inputDto: ILoginUserV1UseCaseInputDto): Promise<ILoginUserV1UseCaseOutputDto> {
    const log: ILog = { module: LoginUserV1UseCase.name, method: 'execute', steps: [], error: null };

    try {
      schemaValidator.validateOrReject(inputSchema, inputDto);
      log.steps.push({ message: 'Validated input dto.' });

      const user = await this.userRepository.findByEmail(inputDto.email);
      if (!user) throw new InvalidCredentialsError('Invalid credentials');
      log.steps.push({ message: 'User found.' });

      const passwordMatch = await bcrypt.compare(inputDto.password, user.password_hash);
      if (!passwordMatch) throw new InvalidCredentialsError('Invalid credentials');
      log.steps.push({ message: 'Password verified.' });

      const token = this.tokenService.sign({ user_id: user._id, email: user.email, role: user.role });
      log.steps.push({ message: 'Token signed.' });

      const entity = new UserV1Entity({ userInputData: user });
      const result = { token, user: entity.toPublicDto() };

      logInfo(`User logged in: ${user._id}`, log);
      return result;
    } catch (err) {
      log.error = err;
      log.steps.push({ message: 'Error while logging in UserV1.' });
      logError('Error logging in UserV1', log);
      throw err;
    }
  }
}
