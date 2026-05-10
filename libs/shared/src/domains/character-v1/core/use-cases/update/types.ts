import { ICharacterV1Dto } from '../../types';

export interface IUpdateCharacterV1UseCaseInputDto {
  id: string;
  name?: string;
  clan_id?: string;
}

export type IUpdateCharacterV1UseCaseOutputDto = ICharacterV1Dto;
