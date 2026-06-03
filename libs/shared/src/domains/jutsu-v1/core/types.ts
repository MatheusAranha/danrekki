export type JutsuElement = 'katon' | 'suiton' | 'doton' | 'futon' | 'raiton';

export const JUTSU_ELEMENTS: JutsuElement[] = ['katon', 'suiton', 'doton', 'futon', 'raiton'];

export interface IJutsuV1Dto {
  _id: string;
  name: string;
  jutsu_rank_id: string;
  keyword_ids: string[];
  elements: JutsuElement[];
  casting_time: string;
  range: string;
  chakra_cost: string;
  components: string;
  duration: string;
  description: string;
  at_higher_ranks: string | null;
  created_at: string;
  updated_at: string;
}
