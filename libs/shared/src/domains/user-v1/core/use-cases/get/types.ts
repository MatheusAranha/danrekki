import { IUserV1PublicDto } from '../../types';

export interface IGetUserV1UseCaseInputDto {
  id: string;
}

export type IGetUserV1UseCaseOutputDto = IUserV1PublicDto;
