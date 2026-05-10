import { ICharacterV1Dto } from '../../types';

export interface ICreateCharacterV1UseCaseInputDto {
  name: string;
  user_id: string;
  clan_id: string;
}

export type ICreateCharacterV1UseCaseOutputDto = ICharacterV1Dto;
