import { SchemaValidationError } from '../../../_shared/errors';
import { LibraryScrollV1Entity } from './entity';
import { LibraryScrollV1AlreadyRentedError } from './errors';
import { libraryScrollV1Factory } from './factory';

describe('LibraryScrollV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid scroll with no rental', () => {
      const dto = libraryScrollV1Factory.generateOne();
      const entity = new LibraryScrollV1Entity({ scrollInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });
  });

  describe('rental behavior', () => {
    it('should set rented_by and rented_at when renting, and isAvailable returns false', () => {
      const dto = libraryScrollV1Factory.generateOne();
      const entity = new LibraryScrollV1Entity({ scrollInputData: dto }).validate();
      expect(entity.isAvailable()).toBe(true);

      const characterId = 'char-123';
      const rented = entity.rent(characterId);
      expect(rented.getDto().rented_by_character_id).toBe(characterId);
      expect(rented.getDto().rented_at).not.toBeNull();
      expect(rented.isAvailable()).toBe(false);
    });

    it('should throw LibraryScrollV1AlreadyRentedError when renting an already-rented scroll', () => {
      const dto = libraryScrollV1Factory.generateOne({
        overrides: { rented_by_character_id: 'existing-char', rented_at: new Date().toISOString() },
      });
      const entity = new LibraryScrollV1Entity({ scrollInputData: dto }).validate();
      expect(() => entity.rent('new-char')).toThrow(LibraryScrollV1AlreadyRentedError);
    });
  });

  describe('return behavior', () => {
    it('should clear rental fields and isAvailable returns true after returnScroll', () => {
      const dto = libraryScrollV1Factory.generateOne({
        overrides: { rented_by_character_id: 'char-abc', rented_at: new Date().toISOString() },
      });
      const entity = new LibraryScrollV1Entity({ scrollInputData: dto }).validate();
      expect(entity.isAvailable()).toBe(false);

      const returned = entity.returnScroll();
      expect(returned.getDto().rented_by_character_id).toBeNull();
      expect(returned.getDto().rented_at).toBeNull();
      expect(returned.isAvailable()).toBe(true);
    });
  });

  describe('validation rules', () => {
    it('should reject a scroll with an empty library_id', () => {
      const dto = libraryScrollV1Factory.generateOne({ overrides: { library_id: '' } });
      const entity = new LibraryScrollV1Entity({ scrollInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
