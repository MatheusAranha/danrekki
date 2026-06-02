import { SchemaValidationError } from '../../../_shared/errors';
import { KeywordV1Entity } from './entity';
import { keywordV1Factory } from './factory';

describe('KeywordV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid keyword entity', () => {
      const dto = keywordV1Factory.generateOne();
      const entity = new KeywordV1Entity({ keywordInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = keywordV1Factory.generateOne();
      const entity = new KeywordV1Entity({ keywordInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a keyword with an empty name', () => {
      const dto = keywordV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new KeywordV1Entity({ keywordInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should accept a keyword with a valid name', () => {
      const dto = keywordV1Factory.generateOne({ overrides: { name: 'Fire Release' } });
      const entity = new KeywordV1Entity({ keywordInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });
  });
});
