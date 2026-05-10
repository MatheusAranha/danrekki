import { ISenseiContentV1Dto } from '../../types';

export interface IUpdateSenseiContentV1UseCaseInputDto {
  id: string;
  required_proximity: number;
}

export type IUpdateSenseiContentV1UseCaseOutputDto = ISenseiContentV1Dto;
