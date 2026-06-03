import { IJutsuV1Dto } from '../../types';

import { JutsuElement } from '../../types';

export interface ICreateJutsuV1UseCaseInputDto {
  name: string;
  jutsu_rank_id: string;
  keyword_ids: string[];
  elements?: JutsuElement[];
  casting_time: string;
  range: string;
  chakra_cost: string;
  components: string;
  duration: string;
  description: string;
  at_higher_ranks: string | null;
}

export type ICreateJutsuV1UseCaseOutputDto = IJutsuV1Dto;
