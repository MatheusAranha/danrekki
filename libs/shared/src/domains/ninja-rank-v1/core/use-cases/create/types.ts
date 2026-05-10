import { INinjaRankV1Dto } from '../../types';

export interface ICreateNinjaRankV1UseCaseInputDto {
  name: string;
  order: number;
}

export type ICreateNinjaRankV1UseCaseOutputDto = INinjaRankV1Dto;
