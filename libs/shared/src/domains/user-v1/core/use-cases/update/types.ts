import { IUserV1PublicDto, UserRole } from '../../types';

export interface IUpdateUserV1UseCaseInputDto {
  id: string;
  email?: string;
  role?: UserRole;
}

export type IUpdateUserV1UseCaseOutputDto = IUserV1PublicDto;
