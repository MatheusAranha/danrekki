import { IDtTransactionV1Dto } from '../../types';

export interface IListByCharacterDtTransactionV1UseCaseInputDto {
  character_id: string;
}

export type IListByCharacterDtTransactionV1UseCaseOutputDto = IDtTransactionV1Dto[];
