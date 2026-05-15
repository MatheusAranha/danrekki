import { ICharacterLearningProgressV1Dto } from '../../types';

export interface IStartLearningV1UseCaseInputDto {
  character_id: string;
  trainable_content_id: string;
}

export type IStartLearningV1UseCaseOutputDto = ICharacterLearningProgressV1Dto;
