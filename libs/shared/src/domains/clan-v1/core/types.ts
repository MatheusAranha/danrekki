export interface IClanV1DtModifier {
  keyword_id: string;
  multiplier: number;
}

export interface IClanV1Dto {
  _id: string;
  name: string;
  dt_modifiers: IClanV1DtModifier[];
  created_at: string;
  updated_at: string;
}
