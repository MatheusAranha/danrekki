import { ICharacterV1Dto } from '../../types';

import { JutsuElement } from '../../types';

export interface IUpdateCharacterV1UseCaseInputDto {
  id: string;
  name?: string;
  clan_id?: string;
  elemental_releases?: JutsuElement[];
}

export type IUpdateCharacterV1UseCaseOutputDto = ICharacterV1Dto;
