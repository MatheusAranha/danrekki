import { SchemaValidationError } from '../../../_shared/errors';
import { NinjaRankV1Entity } from './entity';
import { ninjaRankV1Factory } from './factory';

describe('NinjaRankV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid ninja rank entity', () => {
      const dto = ninjaRankV1Factory.generateOne();
      const entity = new NinjaRankV1Entity({ ninjaRankInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = ninjaRankV1Factory.generateOne();
      const entity = new NinjaRankV1Entity({ ninjaRankInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a ninja rank with an empty name', () => {
      const dto = ninjaRankV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new NinjaRankV1Entity({ ninjaRankInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a ninja rank with order less than 1', () => {
      const dto = ninjaRankV1Factory.generateOne({ overrides: { order: 0 } });
      const entity = new NinjaRankV1Entity({ ninjaRankInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should accept a valid ninja rank', () => {
      const dto = ninjaRankV1Factory.generateOne({ overrides: { name: 'Genin', order: 1 } });
      const entity = new NinjaRankV1Entity({ ninjaRankInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });
  });
});
