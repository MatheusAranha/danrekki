import { ICharacterLearningProgressV1Dto } from '../../types';

export interface IListByCharacterLearningProgressV1UseCaseInputDto {
  character_id: string;
}

export type IListByCharacterLearningProgressV1UseCaseOutputDto = ICharacterLearningProgressV1Dto[];
