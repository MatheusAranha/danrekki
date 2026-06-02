import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { characterKeywordV1EntityJsonSchema } from './entity.schema';
import { ICharacterKeywordV1Dto } from './types';

export class CharacterKeywordV1Entity {
  private readonly dto: ICharacterKeywordV1Dto;

  constructor({ characterKeywordInputData }: { characterKeywordInputData: ICharacterKeywordV1Dto }) {
    this.dto = characterKeywordInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(characterKeywordV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ICharacterKeywordV1Dto {
    return structuredClone(this.dto);
  }
}
