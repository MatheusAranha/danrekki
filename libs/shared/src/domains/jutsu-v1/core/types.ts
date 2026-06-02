export type JutsuElement = 'katon' | 'suiton' | 'doton' | 'futon' | 'raiton' | 'iryo';

export const JUTSU_ELEMENTS: JutsuElement[] = ['katon', 'suiton', 'doton', 'futon', 'raiton', 'iryo'];

export interface IJutsuV1Dto {
  _id: string;
  name: string;
  jutsu_rank_id: string;
  keyword_ids: string[];
  elements: JutsuElement[];
  components: string;
  duration: string;
  description: string;
  created_at: string;
  updated_at: string;
}
