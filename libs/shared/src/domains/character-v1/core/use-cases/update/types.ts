import { ICharacterV1Dto } from '../../types';

import { JutsuElement } from '../../types';

export interface IUpdateCharacterV1UseCaseInputDto {
  id: string;
  name?: string;
  clan_id?: string;
  elemental_releases?: JutsuElement[];
  picture_url?: string | null;
}

export type IUpdateCharacterV1UseCaseOutputDto = ICharacterV1Dto;
