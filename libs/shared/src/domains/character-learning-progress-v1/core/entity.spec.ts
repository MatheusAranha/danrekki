import { CharacterLearningProgressV1Entity } from './entity';
import { LearningProgressV1AlreadyCompletedError } from './errors';
import { characterLearningProgressV1Factory } from './factory';
import { SchemaValidationError } from '../../../_shared/errors';

describe('CharacterLearningProgressV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid progress entity', () => {
      const dto = characterLearningProgressV1Factory.generateOne();
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });

    it('should reject empty character_id', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { character_id: '' } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject empty trainable_content_id', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { trainable_content_id: '' } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject negative dt_invested', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { dt_invested: -1 } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject negative dt_required', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { dt_required: -1 } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject invalid status value', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { status: 'unknown' as never } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });

  describe('investDt workflow', () => {
    it('should stay in_progress when amount invested is less than dt_required', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { dt_invested: 0, dt_required: 100 } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });

      const updated = entity.investDt(50).getDto();

      expect(updated.dt_invested).toBe(50);
      expect(updated.status).toBe('in_progress');
      expect(updated.completed_at).toBeNull();
    });

    it('should mark as completed when amount invested equals dt_required', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { dt_invested: 0, dt_required: 100 } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });

      const updated = entity.investDt(100).getDto();

      expect(updated.dt_invested).toBe(100);
      expect(updated.status).toBe('completed');
      expect(updated.completed_at).not.toBeNull();
    });

    it('should mark as completed when amount invested exceeds dt_required', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { dt_invested: 80, dt_required: 100 } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });

      const updated = entity.investDt(30).getDto();

      expect(updated.dt_invested).toBe(110);
      expect(updated.status).toBe('completed');
      expect(updated.completed_at).not.toBeNull();
    });

    it('should throw LearningProgressV1AlreadyCompletedError when already completed', () => {
      const dto = characterLearningProgressV1Factory.generateOne({
        overrides: {
          dt_invested: 100,
          dt_required: 100,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });

      expect(() => entity.investDt(10)).toThrow(LearningProgressV1AlreadyCompletedError);
    });
  });

  describe('isCompleted check', () => {
    it('should return false for in_progress status', () => {
      const dto = characterLearningProgressV1Factory.generateOne({ overrides: { status: 'in_progress' } });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(entity.isCompleted()).toBe(false);
    });

    it('should return true for completed status', () => {
      const dto = characterLearningProgressV1Factory.generateOne({
        overrides: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          dt_invested: 100,
          dt_required: 100,
        },
      });
      const entity = new CharacterLearningProgressV1Entity({ progressInputData: dto });
      expect(entity.isCompleted()).toBe(true);
    });
  });
});
