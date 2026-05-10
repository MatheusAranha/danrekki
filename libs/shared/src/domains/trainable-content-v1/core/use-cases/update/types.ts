import { ITrainableContentV1Dto } from '../../types';

export interface IUpdateTrainableContentV1UseCaseInputDto {
  id: string;
  name?: string;
  description?: string;
  base_dt_cost?: number;
}

export type IUpdateTrainableContentV1UseCaseOutputDto = ITrainableContentV1Dto;
