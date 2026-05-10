import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { characterSenseiV1EntityJsonSchema } from './entity.schema';
import { ICharacterSenseiV1Dto } from './types';

export class CharacterSenseiV1Entity {
  private readonly dto: ICharacterSenseiV1Dto;

  constructor({ characterSenseiInputData }: { characterSenseiInputData: ICharacterSenseiV1Dto }) {
    this.dto = characterSenseiInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(characterSenseiV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ICharacterSenseiV1Dto {
    return structuredClone(this.dto);
  }
}
