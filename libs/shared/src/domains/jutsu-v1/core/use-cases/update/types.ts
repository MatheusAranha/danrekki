import { IJutsuV1Dto } from '../../types';

export interface IUpdateJutsuV1UseCaseInputDto {
  id: string;
  name?: string;
  jutsu_rank_id?: string;
  release_id?: string;
  components?: string;
  duration?: string;
  description?: string;
}

export type IUpdateJutsuV1UseCaseOutputDto = IJutsuV1Dto;
