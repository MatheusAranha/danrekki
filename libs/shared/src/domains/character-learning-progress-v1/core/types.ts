export type LearningProgressV1Status = 'in_progress' | 'completed';

export interface ICharacterLearningProgressV1Dto {
  _id: string;
  character_id: string;
  trainable_content_id: string;
  dt_invested: number;
  dt_required: number;
  status: LearningProgressV1Status;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}
