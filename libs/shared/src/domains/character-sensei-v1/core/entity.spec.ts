import { SchemaValidationError } from '../../../_shared/errors';
import { CharacterSenseiV1Entity } from './entity';
import { characterSenseiV1Factory } from './factory';

describe('CharacterSenseiV1Entity', () => {
  describe('validation rules', () => {
    it('should pass validation for a valid character sensei entity', () => {
      const dto = characterSenseiV1Factory.generateOne();
      const entity = new CharacterSenseiV1Entity({ characterSenseiInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });

    it('should reject proximity of 0', () => {
      const dto = characterSenseiV1Factory.generateOne({ overrides: { proximity: 0 } });
      const entity = new CharacterSenseiV1Entity({ characterSenseiInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject proximity greater than 10', () => {
      const dto = characterSenseiV1Factory.generateOne({ overrides: { proximity: 11 } });
      const entity = new CharacterSenseiV1Entity({ characterSenseiInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject empty character_id', () => {
      const dto = characterSenseiV1Factory.generateOne({ overrides: { character_id: '' } });
      const entity = new CharacterSenseiV1Entity({ characterSenseiInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject empty sensei_id', () => {
      const dto = characterSenseiV1Factory.generateOne({ overrides: { sensei_id: '' } });
      const entity = new CharacterSenseiV1Entity({ characterSenseiInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
