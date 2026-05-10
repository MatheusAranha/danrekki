import { ICharacterSenseiV1Dto } from '../../types';

export interface IListByCharacterCharacterSenseiV1UseCaseInputDto {
  character_id: string;
}

export type IListByCharacterCharacterSenseiV1UseCaseOutputDto = ICharacterSenseiV1Dto[];
