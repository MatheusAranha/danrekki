import { IJutsuV1Dto } from '../../types';

import { JutsuElement } from '../../types';

export interface IUpdateJutsuV1UseCaseInputDto {
  id: string;
  name?: string;
  jutsu_rank_id?: string;
  keyword_ids?: string[];
  elements?: JutsuElement[];
  components?: string;
  duration?: string;
  description?: string;
}

export type IUpdateJutsuV1UseCaseOutputDto = IJutsuV1Dto;
