import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { libraryV1EntityJsonSchema } from './entity.schema';
import { ILibraryV1Dto } from './types';

export class LibraryV1Entity {
  private readonly dto: ILibraryV1Dto;

  constructor({ libraryInputData }: { libraryInputData: ILibraryV1Dto }) {
    this.dto = libraryInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(libraryV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ILibraryV1Dto {
    return structuredClone(this.dto);
  }
}
