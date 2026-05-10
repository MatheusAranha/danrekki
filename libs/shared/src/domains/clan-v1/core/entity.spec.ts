import { SchemaValidationError } from '../../../_shared/errors';
import { ClanV1Entity } from './entity';
import { clanV1Factory } from './factory';

describe('ClanV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid clan entity', () => {
      const dto = clanV1Factory.generateOne();
      const entity = new ClanV1Entity({ clanInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = clanV1Factory.generateOne();
      const entity = new ClanV1Entity({ clanInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a clan with an empty name', () => {
      const dto = clanV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new ClanV1Entity({ clanInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a modifier multiplier of zero', () => {
      const dto = clanV1Factory.generateOne({
        overrides: { dt_modifiers: [{ release_id: 'r1', multiplier: 0 }] },
      });
      const entity = new ClanV1Entity({ clanInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a modifier multiplier greater than 1', () => {
      const dto = clanV1Factory.generateOne({
        overrides: { dt_modifiers: [{ release_id: 'r1', multiplier: 1.5 }] },
      });
      const entity = new ClanV1Entity({ clanInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should accept a clan with valid dt_modifiers', () => {
      const dto = clanV1Factory.generateOne({
        overrides: { dt_modifiers: [{ release_id: 'r1', multiplier: 0.75 }] },
      });
      const entity = new ClanV1Entity({ clanInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });
  });
});
