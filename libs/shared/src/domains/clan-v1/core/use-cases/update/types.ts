import { IClanV1DtModifier, IClanV1Dto } from '../../types';

export interface IUpdateClanV1UseCaseInputDto {
  id: string;
  name?: string;
  dt_modifiers?: IClanV1DtModifier[];
}

export type IUpdateClanV1UseCaseOutputDto = IClanV1Dto;
