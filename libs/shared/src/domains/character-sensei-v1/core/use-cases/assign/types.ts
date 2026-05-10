import { ICharacterSenseiV1Dto } from '../../types';

export interface IAssignCharacterSenseiV1UseCaseInputDto {
  character_id: string;
  sensei_id: string;
  proximity: number;
}

export type IAssignCharacterSenseiV1UseCaseOutputDto = ICharacterSenseiV1Dto;
