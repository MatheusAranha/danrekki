import { ITrainableContentV1Dto, TrainableContentType } from '../../types';

export interface ICreateTrainableContentV1UseCaseInputDto {
  type: TrainableContentType;
  jutsu_id?: string | null;
  name: string;
  description: string;
  base_dt_cost: number;
}

export type ICreateTrainableContentV1UseCaseOutputDto = ITrainableContentV1Dto;
