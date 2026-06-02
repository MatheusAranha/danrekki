import { IKeywordV1Dto } from '../../types';

export interface ICreateKeywordV1UseCaseInputDto {
  name: string;
}

export type ICreateKeywordV1UseCaseOutputDto = IKeywordV1Dto;
