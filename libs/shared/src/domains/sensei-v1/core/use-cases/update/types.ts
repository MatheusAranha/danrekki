import { ISenseiV1Dto } from '../../types';

export interface IUpdateSenseiV1UseCaseInputDto {
  id: string;
  name?: string;
  description?: string;
}

export type IUpdateSenseiV1UseCaseOutputDto = ISenseiV1Dto;
