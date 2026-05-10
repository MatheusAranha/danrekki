import { IClanV1DtModifier, IClanV1Dto } from '../../types';

export interface ICreateClanV1UseCaseInputDto {
  name: string;
  dt_modifiers?: IClanV1DtModifier[];
}

export type ICreateClanV1UseCaseOutputDto = IClanV1Dto;
