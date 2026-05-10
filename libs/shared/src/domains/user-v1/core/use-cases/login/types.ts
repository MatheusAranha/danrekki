import { IUserV1PublicDto } from '../../types';

export interface ILoginUserV1UseCaseInputDto {
  email: string;
  password: string;
}

export interface ILoginUserV1UseCaseOutputDto {
  token: string;
  user: IUserV1PublicDto;
}
