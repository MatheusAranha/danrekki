import { ICharacterLibraryV1Dto } from '../../types';

export interface IListByCharacterCharacterLibraryV1UseCaseInputDto {
  character_id: string;
}

export type IListByCharacterCharacterLibraryV1UseCaseOutputDto = ICharacterLibraryV1Dto[];
