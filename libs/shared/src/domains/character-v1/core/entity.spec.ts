import { SchemaValidationError } from '../../../_shared/errors';
import { CharacterV1Entity } from './entity';
import { characterV1Factory } from './factory';

describe('CharacterV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid character entity', () => {
      const dto = characterV1Factory.generateOne();
      const entity = new CharacterV1Entity({ characterInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });
  });

  describe('validation rules', () => {
    it('should reject a character with a negative available_dt', () => {
      const dto = characterV1Factory.generateOne({ overrides: { available_dt: -1 } });
      const entity = new CharacterV1Entity({ characterInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a character with an empty name', () => {
      const dto = characterV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new CharacterV1Entity({ characterInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
