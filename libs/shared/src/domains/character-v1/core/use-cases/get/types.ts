import { ICharacterV1Dto } from '../../types';

export interface IGetCharacterV1UseCaseInputDto {
  id: string;
}

export type IGetCharacterV1UseCaseOutputDto = ICharacterV1Dto;
