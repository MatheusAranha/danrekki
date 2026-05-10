import { ISenseiContentV1Dto } from '../../types';

export interface IListBySenseiSenseiContentV1UseCaseInputDto {
  sensei_id: string;
}

export type IListBySenseiSenseiContentV1UseCaseOutputDto = ISenseiContentV1Dto[];
