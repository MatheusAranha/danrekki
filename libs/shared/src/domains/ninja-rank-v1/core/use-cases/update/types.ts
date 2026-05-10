import { INinjaRankV1Dto } from '../../types';

export interface IUpdateNinjaRankV1UseCaseInputDto {
  id: string;
  name?: string;
  order?: number;
}

export type IUpdateNinjaRankV1UseCaseOutputDto = INinjaRankV1Dto;
