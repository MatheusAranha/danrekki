import { ICharacterKeywordV1Dto } from '../../types';

export interface IAssignCharacterKeywordV1UseCaseInputDto {
  character_id: string;
  keyword_id: string;
}

export type IAssignCharacterKeywordV1UseCaseOutputDto = ICharacterKeywordV1Dto;
