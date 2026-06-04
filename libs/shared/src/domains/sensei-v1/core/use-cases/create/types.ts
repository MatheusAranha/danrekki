import { ISenseiV1Dto } from '../../types';

export interface ICreateSenseiV1UseCaseInputDto {
  name: string;
  description: string;
  picture_url?: string | null;
}

export type ICreateSenseiV1UseCaseOutputDto = ISenseiV1Dto;
