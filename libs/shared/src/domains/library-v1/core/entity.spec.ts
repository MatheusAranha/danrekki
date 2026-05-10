import { SchemaValidationError } from '../../../_shared/errors';
import { LibraryV1Entity } from './entity';
import { libraryV1Factory } from './factory';

describe('LibraryV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid library entity', () => {
      const dto = libraryV1Factory.generateOne();
      const entity = new LibraryV1Entity({ libraryInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = libraryV1Factory.generateOne();
      const entity = new LibraryV1Entity({ libraryInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a library with an empty name', () => {
      const dto = libraryV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new LibraryV1Entity({ libraryInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
