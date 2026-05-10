import { ICharacterReleaseV1Dto } from '../../types';

export interface IAssignCharacterReleaseV1UseCaseInputDto {
  character_id: string;
  release_id: string;
}

export type IAssignCharacterReleaseV1UseCaseOutputDto = ICharacterReleaseV1Dto;
