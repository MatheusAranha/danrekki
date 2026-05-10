import { IUserV1PublicDto, UserRole } from '../../types';

export interface ICreateUserV1UseCaseInputDto {
  email: string;
  password: string;
  role: UserRole;
}

export type ICreateUserV1UseCaseOutputDto = IUserV1PublicDto;
