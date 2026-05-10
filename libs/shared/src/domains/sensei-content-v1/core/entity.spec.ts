import { SchemaValidationError } from '../../../_shared/errors';
import { SenseiContentV1Entity } from './entity';
import { senseiContentV1Factory } from './factory';

describe('SenseiContentV1Entity', () => {
  describe('validation rules', () => {
    it('should pass validation for a valid sensei content entity', () => {
      const dto = senseiContentV1Factory.generateOne();
      const entity = new SenseiContentV1Entity({ senseiContentInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });

    it('should reject required_proximity of 0', () => {
      const dto = senseiContentV1Factory.generateOne({ overrides: { required_proximity: 0 } });
      const entity = new SenseiContentV1Entity({ senseiContentInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject required_proximity greater than 10', () => {
      const dto = senseiContentV1Factory.generateOne({ overrides: { required_proximity: 11 } });
      const entity = new SenseiContentV1Entity({ senseiContentInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
