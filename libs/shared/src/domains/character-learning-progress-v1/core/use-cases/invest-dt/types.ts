import { ICharacterLearningProgressV1Dto } from '../../types';

export interface IInvestDtV1UseCaseInputDto {
  progress_id: string;
  amount: number;
}

export type IInvestDtV1UseCaseOutputDto = ICharacterLearningProgressV1Dto;
