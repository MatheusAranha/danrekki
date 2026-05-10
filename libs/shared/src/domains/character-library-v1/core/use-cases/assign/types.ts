import { ICharacterLibraryV1Dto } from '../../types';

export interface IAssignCharacterLibraryV1UseCaseInputDto {
  character_id: string;
  library_id: string;
  required_ninja_rank_id: string;
}

export type IAssignCharacterLibraryV1UseCaseOutputDto = ICharacterLibraryV1Dto;
