import { ILibraryV1Dto } from '../../types';

export interface IGetLibraryV1UseCaseInputDto {
  id: string;
}

export type IGetLibraryV1UseCaseOutputDto = ILibraryV1Dto;
