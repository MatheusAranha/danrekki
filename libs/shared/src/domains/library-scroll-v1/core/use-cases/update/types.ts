import { ILibraryScrollV1Dto } from '../../types';

export interface IUpdateLibraryScrollV1UseCaseInputDto {
  id: string;
  jutsu_id?: string;
  required_ninja_rank_id?: string;
}

export type IUpdateLibraryScrollV1UseCaseOutputDto = ILibraryScrollV1Dto;
