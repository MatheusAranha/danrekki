import { SchemaValidationError } from '../../../_shared/errors';
import { JutsuRankV1Entity } from './entity';
import { jutsuRankV1Factory } from './factory';

describe('JutsuRankV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid jutsu rank entity', () => {
      const dto = jutsuRankV1Factory.generateOne();
      const entity = new JutsuRankV1Entity({ jutsuRankInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = jutsuRankV1Factory.generateOne();
      const entity = new JutsuRankV1Entity({ jutsuRankInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a jutsu rank with an empty name', () => {
      const dto = jutsuRankV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new JutsuRankV1Entity({ jutsuRankInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a jutsu rank with order less than 1', () => {
      const dto = jutsuRankV1Factory.generateOne({ overrides: { order: 0 } });
      const entity = new JutsuRankV1Entity({ jutsuRankInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a jutsu rank with dt_cost less than 1', () => {
      const dto = jutsuRankV1Factory.generateOne({ overrides: { dt_cost: 0 } });
      const entity = new JutsuRankV1Entity({ jutsuRankInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should accept a valid jutsu rank', () => {
      const dto = jutsuRankV1Factory.generateOne({ overrides: { name: 'D-Rank', order: 1, dt_cost: 8 } });
      const entity = new JutsuRankV1Entity({ jutsuRankInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });
  });
});
