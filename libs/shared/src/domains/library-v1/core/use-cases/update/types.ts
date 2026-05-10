import { ILibraryV1Dto } from '../../types';

export interface IUpdateLibraryV1UseCaseInputDto {
  id: string;
  name?: string;
  description?: string;
}

export type IUpdateLibraryV1UseCaseOutputDto = ILibraryV1Dto;
