import { ICharacterLearningProgressV1Dto } from '../../types';

export type DtInvestSource = 'solo' | 'library' | 'sensei';

export interface IInvestDtV1UseCaseInputDto {
  progress_id: string;
  amount: number;
  source: DtInvestSource;
}

export type IInvestDtV1UseCaseOutputDto = ICharacterLearningProgressV1Dto;
