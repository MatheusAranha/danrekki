import { SchemaValidationError } from '../../../_shared/errors';
import { DtTransactionV1Entity } from './entity';
import { dtTransactionV1Factory } from './factory';

describe('DtTransactionV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid DT transaction entity', () => {
      const dto = dtTransactionV1Factory.generateOne();
      const entity = new DtTransactionV1Entity({ transactionInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });

    it('should create a valid credit transaction (positive amount)', () => {
      const dto = dtTransactionV1Factory.generateOne({ overrides: { amount: 10 } });
      const entity = new DtTransactionV1Entity({ transactionInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });

    it('should create a valid debit transaction (negative amount)', () => {
      const dto = dtTransactionV1Factory.generateOne({ overrides: { amount: -5 } });
      const entity = new DtTransactionV1Entity({ transactionInputData: dto });
      expect(() => entity.validate()).not.toThrow();
    });
  });

  describe('validation rules', () => {
    it('should reject a transaction with an empty character_id', () => {
      const dto = dtTransactionV1Factory.generateOne({ overrides: { character_id: '' } });
      const entity = new DtTransactionV1Entity({ transactionInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a transaction with an empty reason', () => {
      const dto = dtTransactionV1Factory.generateOne({ overrides: { reason: '' } });
      const entity = new DtTransactionV1Entity({ transactionInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject a transaction with an empty _id', () => {
      const dto = dtTransactionV1Factory.generateOne({ overrides: { _id: '' } });
      const entity = new DtTransactionV1Entity({ transactionInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
