import { ICharacterLearningProgressV1Dto } from '../../types';

export interface IAdminGrantJutsuV1UseCaseInputDto {
  character_id: string;
  trainable_content_id: string;
}

export type IAdminGrantJutsuV1UseCaseOutputDto = ICharacterLearningProgressV1Dto;
