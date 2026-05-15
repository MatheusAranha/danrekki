import { ITrainableContentV1Dto } from '../../../../trainable-content-v1/core/types';
import { IJutsuV1Dto } from '../../../../jutsu-v1/core/types';
import { ICharacterLearningProgressV1Dto } from '../../types';

export interface ICatalogLibrarySource {
  type: 'library';
  library_id: string;
}

export interface ICatalogSenseiSource {
  type: 'sensei';
  sensei_id: string;
}

export interface ICatalogEntryV1Dto {
  trainable_content: ITrainableContentV1Dto;
  jutsu: IJutsuV1Dto | null;
  dt_cost: number;
  source: ICatalogLibrarySource | ICatalogSenseiSource;
  learning_progress: ICharacterLearningProgressV1Dto | null;
}

export interface IGetTrainingCatalogV1UseCaseInputDto {
  character_id: string;
  include_ineligible?: boolean;
}

export interface IGetTrainingCatalogV1UseCaseOutputDto {
  library_entries: ICatalogEntryV1Dto[];
  sensei_entries: ICatalogEntryV1Dto[];
}
