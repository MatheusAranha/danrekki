import { IReleaseV1Dto } from '../../types';

export interface IUpdateReleaseV1UseCaseInputDto {
  id: string;
  name?: string;
}

export type IUpdateReleaseV1UseCaseOutputDto = IReleaseV1Dto;
