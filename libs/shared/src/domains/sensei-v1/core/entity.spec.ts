import { SchemaValidationError } from '../../../_shared/errors';
import { SenseiV1Entity } from './entity';
import { senseiV1Factory } from './factory';

describe('SenseiV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid sensei entity', () => {
      const dto = senseiV1Factory.generateOne();
      const entity = new SenseiV1Entity({ senseiInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should return a deep copy from getDto', () => {
      const dto = senseiV1Factory.generateOne();
      const entity = new SenseiV1Entity({ senseiInputData: dto }).validate();
      const result = entity.getDto();
      result.name = 'mutated';
      expect(entity.getDto().name).toBe(dto.name);
    });
  });

  describe('validation rules', () => {
    it('should reject a sensei with an empty name', () => {
      const dto = senseiV1Factory.generateOne({ overrides: { name: '' } });
      const entity = new SenseiV1Entity({ senseiInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
