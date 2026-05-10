import { SchemaValidationError } from '../../../_shared/errors';
import { UserV1Entity } from './entity';
import { userV1Factory } from './factory';

describe('UserV1Entity', () => {
  describe('entity creation', () => {
    it('should create a valid user entity and return dto', () => {
      const dto = userV1Factory.generateOne();
      const entity = new UserV1Entity({ userInputData: dto });
      expect(entity.validate().getDto()).toEqual(dto);
    });
  });

  describe('toPublicDto', () => {
    it('should not include password_hash in public dto', () => {
      const dto = userV1Factory.generateOne();
      const entity = new UserV1Entity({ userInputData: dto }).validate();
      const publicDto = entity.toPublicDto();
      expect(publicDto).not.toHaveProperty('password_hash');
      expect(publicDto._id).toBe(dto._id);
      expect(publicDto.email).toBe(dto.email);
      expect(publicDto.role).toBe(dto.role);
    });
  });

  describe('validation rules', () => {
    it('should reject an invalid email', () => {
      const dto = userV1Factory.generateOne({ overrides: { email: 'not-an-email' } });
      const entity = new UserV1Entity({ userInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });

    it('should reject an invalid role', () => {
      const dto = userV1Factory.generateOne({ overrides: { role: 'superuser' as never } });
      const entity = new UserV1Entity({ userInputData: dto });
      expect(() => entity.validate()).toThrow(SchemaValidationError);
    });
  });
});
