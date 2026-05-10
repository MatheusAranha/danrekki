import { ILibraryV1Dto } from '../../types';

export interface ICreateLibraryV1UseCaseInputDto {
  name: string;
  description: string;
}

export type ICreateLibraryV1UseCaseOutputDto = ILibraryV1Dto;
