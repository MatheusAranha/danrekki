import { SchemaValidationError } from '../../../_shared/errors';
import { CharacterLibraryV1Entity } from './entity';
import { characterLibraryV1Factory } from './factory';

describe('CharacterLibraryV1Entity', () => {
  describe('validation rules', () => {
    it('should pass validation for a valid character library entity', () => {
      const dto = characterLibraryV1Factory.generateOne();
      const entity = new CharacterLibraryV1Entity({ characterLibraryInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });

    it('should reject empty character_id', () => {
      const dto = characterLibraryV1Factory.generateOne({ overrides: { character_id: '' } });
      const entity = new CharacterLibraryV1Entity({ characterLibraryInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject empty library_id', () => {
      const dto = characterLibraryV1Factory.generateOne({ overrides: { library_id: '' } });
      const entity = new CharacterLibraryV1Entity({ characterLibraryInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject empty required_ninja_rank_id', () => {
      const dto = characterLibraryV1Factory.generateOne({ overrides: { required_ninja_rank_id: '' } });
      const entity = new CharacterLibraryV1Entity({ characterLibraryInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
