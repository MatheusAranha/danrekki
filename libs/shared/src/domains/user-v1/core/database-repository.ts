import { IUserV1Dto } from './types';

export abstract class UserV1DatabaseRepository {
  abstract findById(id: string): Promise<IUserV1Dto | null>;
  abstract findByEmail(email: string): Promise<IUserV1Dto | null>;
  abstract findAll(): Promise<IUserV1Dto[]>;
  abstract save(dto: IUserV1Dto): Promise<IUserV1Dto>;
  abstract update(
    id: string,
    updates: Partial<Pick<IUserV1Dto, 'email' | 'role' | 'password_hash' | 'updated_at'>>,
  ): Promise<IUserV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
