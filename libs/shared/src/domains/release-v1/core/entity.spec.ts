import { SchemaValidationError } from '../../../_shared/errors';
import { ReleaseV1Entity } from './entity';
import { releaseV1Factory } from './factory';

describe('ReleaseV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid release entity', () => {
      const dto = releaseV1Factory.generateOne();
      const entity = new ReleaseV1Entity({ releaseInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = releaseV1Factory.generateOne();
      const entity = new ReleaseV1Entity({ releaseInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a release with an empty name', () => {
      const dto = releaseV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new ReleaseV1Entity({ releaseInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should accept a release with a valid name', () => {
      const dto = releaseV1Factory.generateOne({ overrides: { name: 'Fire Release' } });
      const entity = new ReleaseV1Entity({ releaseInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });
  });
});
