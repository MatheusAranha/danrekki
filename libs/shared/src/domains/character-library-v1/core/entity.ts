import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { characterLibraryV1EntityJsonSchema } from './entity.schema';
import { ICharacterLibraryV1Dto } from './types';

export class CharacterLibraryV1Entity {
  private readonly dto: ICharacterLibraryV1Dto;

  constructor({ characterLibraryInputData }: { characterLibraryInputData: ICharacterLibraryV1Dto }) {
    this.dto = characterLibraryInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(characterLibraryV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ICharacterLibraryV1Dto {
    return structuredClone(this.dto);
  }
}
