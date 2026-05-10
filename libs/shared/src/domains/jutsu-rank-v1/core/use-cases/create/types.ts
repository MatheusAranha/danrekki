import { IJutsuRankV1Dto } from '../../types';

export interface ICreateJutsuRankV1UseCaseInputDto {
  name: string;
  order: number;
  dt_cost: number;
}

export type ICreateJutsuRankV1UseCaseOutputDto = IJutsuRankV1Dto;
