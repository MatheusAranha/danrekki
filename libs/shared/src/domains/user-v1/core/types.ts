import { UserRole } from '../../../_shared/auth/token-service';

export { UserRole };

export interface IUserV1Dto {
  _id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type IUserV1PublicDto = Omit<IUserV1Dto, 'password_hash'>;
