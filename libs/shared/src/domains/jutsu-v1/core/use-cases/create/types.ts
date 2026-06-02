import { IJutsuV1Dto } from '../../types';

import { JutsuElement } from '../../types';

export interface ICreateJutsuV1UseCaseInputDto {
  name: string;
  jutsu_rank_id: string;
  keyword_ids: string[];
  elements?: JutsuElement[];
  components: string;
  duration: string;
  description: string;
}

export type ICreateJutsuV1UseCaseOutputDto = IJutsuV1Dto;
