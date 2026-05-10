import { ILibraryScrollV1Dto } from '../../types';

export interface ICreateLibraryScrollV1UseCaseInputDto {
  library_id: string;
  jutsu_id: string;
  required_ninja_rank_id: string;
}

export type ICreateLibraryScrollV1UseCaseOutputDto = ILibraryScrollV1Dto;
