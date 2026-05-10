import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { characterReleaseV1EntityJsonSchema } from './entity.schema';
import { ICharacterReleaseV1Dto } from './types';

export class CharacterReleaseV1Entity {
  private readonly dto: ICharacterReleaseV1Dto;

  constructor({ characterReleaseInputData }: { characterReleaseInputData: ICharacterReleaseV1Dto }) {
    this.dto = characterReleaseInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(characterReleaseV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ICharacterReleaseV1Dto {
    return structuredClone(this.dto);
  }
}
