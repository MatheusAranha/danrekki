import { IKeywordV1Dto } from '../../types';

export interface IUpdateKeywordV1UseCaseInputDto {
  id: string;
  name?: string;
}

export type IUpdateKeywordV1UseCaseOutputDto = IKeywordV1Dto;
