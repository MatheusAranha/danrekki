import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { characterV1EntityJsonSchema } from './entity.schema';
import { ICharacterV1Dto } from './types';

export class CharacterV1Entity {
  private readonly dto: ICharacterV1Dto;

  constructor({ characterInputData }: { characterInputData: ICharacterV1Dto }) {
    this.dto = characterInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(characterV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ICharacterV1Dto {
    return structuredClone(this.dto);
  }
}
