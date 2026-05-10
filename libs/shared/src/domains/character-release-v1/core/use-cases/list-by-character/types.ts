import { ICharacterReleaseV1Dto } from '../../types';

export interface IListByCharacterCharacterReleaseV1UseCaseInputDto {
  character_id: string;
}

export type IListByCharacterCharacterReleaseV1UseCaseOutputDto = ICharacterReleaseV1Dto[];
