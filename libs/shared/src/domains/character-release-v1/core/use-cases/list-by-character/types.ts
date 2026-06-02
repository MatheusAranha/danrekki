import { ICharacterKeywordV1Dto } from '../../types';

export interface IListByCharacterCharacterKeywordV1UseCaseInputDto {
  character_id: string;
}

export type IListByCharacterCharacterKeywordV1UseCaseOutputDto = ICharacterKeywordV1Dto[];
