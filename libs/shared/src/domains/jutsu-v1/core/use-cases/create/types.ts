import { IJutsuV1Dto } from '../../types';

export interface ICreateJutsuV1UseCaseInputDto {
  name: string;
  jutsu_rank_id: string;
  release_id: string;
  components: string;
  duration: string;
  description: string;
}

export type ICreateJutsuV1UseCaseOutputDto = IJutsuV1Dto;
