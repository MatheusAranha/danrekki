export type TrainableContentType = 'jutsu' | 'tool' | 'weapon_or_armor' | 'skill_proficiency' | 'feat';

export const TRAINABLE_CONTENT_DEFAULT_COSTS: Record<Exclude<TrainableContentType, 'jutsu'>, number> = {
  tool: 16,
  weapon_or_armor: 32,
  skill_proficiency: 64,
  feat: 128,
};

export interface ITrainableContentV1Dto {
  _id: string;
  type: TrainableContentType;
  jutsu_id: string | null;
  name: string;
  description: string;
  base_dt_cost: number;
  created_at: string;
  updated_at: string;
}
