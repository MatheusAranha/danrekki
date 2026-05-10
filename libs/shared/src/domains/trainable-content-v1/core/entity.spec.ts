import { SchemaValidationError } from '../../../_shared/errors';
import { TrainableContentV1Entity } from './entity';
import { trainableContentV1Factory } from './factory';

describe('TrainableContentV1Entity', () => {
  describe('validation rules', () => {
    it('should pass validation for valid non-jutsu trainable content', () => {
      const dto = trainableContentV1Factory.generateOne({ overrides: { type: 'tool', jutsu_id: null } });
      const entity = new TrainableContentV1Entity({ contentInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });

    it('should pass validation for valid jutsu trainable content', () => {
      const dto = trainableContentV1Factory.generateOne({ overrides: { type: 'jutsu', jutsu_id: 'some-id' } });
      const entity = new TrainableContentV1Entity({ contentInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });

    it('should reject jutsu type with null jutsu_id', () => {
      const dto = trainableContentV1Factory.generateOne({ overrides: { type: 'jutsu', jutsu_id: null } });
      const entity = new TrainableContentV1Entity({ contentInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject non-jutsu type with a non-null jutsu_id', () => {
      const dto = trainableContentV1Factory.generateOne({ overrides: { type: 'tool', jutsu_id: 'some-id' } });
      const entity = new TrainableContentV1Entity({ contentInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject base_dt_cost of 0', () => {
      const dto = trainableContentV1Factory.generateOne({ overrides: { type: 'tool', jutsu_id: null, base_dt_cost: 0 } });
      const entity = new TrainableContentV1Entity({ contentInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
