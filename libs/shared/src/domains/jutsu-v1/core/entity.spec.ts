import { SchemaValidationError } from '../../../_shared/errors';
import { JutsuV1Entity } from './entity';
import { jutsuV1Factory } from './factory';

describe('JutsuV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid jutsu entity', () => {
      const dto = jutsuV1Factory.generateOne();
      const entity = new JutsuV1Entity({ jutsuInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = jutsuV1Factory.generateOne();
      const entity = new JutsuV1Entity({ jutsuInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a jutsu with an empty name', () => {
      const dto = jutsuV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new JutsuV1Entity({ jutsuInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a jutsu with an empty jutsu_rank_id', () => {
      const dto = jutsuV1Factory.generateOne({ overrides: { jutsu_rank_id: '' } });
      const entity = new JutsuV1Entity({ jutsuInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a jutsu with an empty release_id', () => {
      const dto = jutsuV1Factory.generateOne({ overrides: { release_id: '' } });
      const entity = new JutsuV1Entity({ jutsuInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should accept a jutsu with all valid fields', () => {
      const dto = jutsuV1Factory.generateOne();
      const entity = new JutsuV1Entity({ jutsuInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });
  });
});
