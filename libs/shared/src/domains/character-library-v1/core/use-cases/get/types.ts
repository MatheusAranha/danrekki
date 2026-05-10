import { ICharacterLibraryV1Dto } from '../../types';

export interface IGetCharacterLibraryV1UseCaseInputDto {
  id: string;
}

export type IGetCharacterLibraryV1UseCaseOutputDto = ICharacterLibraryV1Dto;
