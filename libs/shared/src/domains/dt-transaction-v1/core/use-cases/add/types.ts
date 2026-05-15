import { IDtTransactionV1Dto } from '../../types';

export interface IAddDtTransactionV1UseCaseInputDto {
  character_id: string;
  amount: number;
  reason: string;
}

export type IAddDtTransactionV1UseCaseOutputDto = IDtTransactionV1Dto;
