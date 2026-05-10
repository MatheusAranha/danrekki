import { ISenseiContentV1Dto } from '../../types';

export interface IAssignSenseiContentV1UseCaseInputDto {
  sensei_id: string;
  trainable_content_id: string;
  required_proximity: number;
}

export type IAssignSenseiContentV1UseCaseOutputDto = ISenseiContentV1Dto;
