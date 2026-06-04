import { ISenseiV1Dto } from '../../types';

export interface IUpdateSenseiV1UseCaseInputDto {
  id: string;
  name?: string;
  description?: string;
  picture_url?: string | null;
}

export type IUpdateSenseiV1UseCaseOutputDto = ISenseiV1Dto;
