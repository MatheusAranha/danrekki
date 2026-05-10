import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { userV1EntityJsonSchema } from './entity.schema';
import { IUserV1Dto, IUserV1PublicDto } from './types';

export class UserV1Entity {
  private readonly dto: IUserV1Dto;

  constructor({ userInputData }: { userInputData: IUserV1Dto }) {
    this.dto = userInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(userV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): IUserV1Dto {
    return structuredClone(this.dto);
  }

  toPublicDto(): IUserV1PublicDto {
    const { password_hash: _, ...publicDto } = structuredClone(this.dto);
    return publicDto;
  }
}
