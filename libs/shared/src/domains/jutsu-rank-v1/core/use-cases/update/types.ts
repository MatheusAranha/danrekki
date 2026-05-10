import { IJutsuRankV1Dto } from '../../types';

export interface IUpdateJutsuRankV1UseCaseInputDto {
  id: string;
  name?: string;
  order?: number;
  dt_cost?: number;
}

export type IUpdateJutsuRankV1UseCaseOutputDto = IJutsuRankV1Dto;
