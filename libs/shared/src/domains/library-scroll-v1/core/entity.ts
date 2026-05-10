import { schemaValidator } from '../../../_shared/validators/json-schema-validator';
import { libraryScrollV1EntityJsonSchema } from './entity.schema';
import { LibraryScrollV1AlreadyRentedError } from './errors';
import { ILibraryScrollV1Dto } from './types';

export class LibraryScrollV1Entity {
  private readonly dto: ILibraryScrollV1Dto;

  constructor({ scrollInputData }: { scrollInputData: ILibraryScrollV1Dto }) {
    this.dto = scrollInputData;
  }

  validate(): this {
    schemaValidator.validateOrReject(libraryScrollV1EntityJsonSchema, this.dto);
    return this;
  }

  getDto(): ILibraryScrollV1Dto {
    return structuredClone(this.dto);
  }

  isAvailable(): boolean {
    return this.dto.rented_by_character_id === null;
  }

  rent(characterId: string): LibraryScrollV1Entity {
    if (!this.isAvailable()) {
      throw new LibraryScrollV1AlreadyRentedError(
        `Scroll ${this.dto._id} is already rented by character ${this.dto.rented_by_character_id}`,
      );
    }
    const now = new Date().toISOString();
    return new LibraryScrollV1Entity({
      scrollInputData: {
        ...structuredClone(this.dto),
        rented_by_character_id: characterId,
        rented_at: now,
        updated_at: now,
      },
    });
  }

  returnScroll(): LibraryScrollV1Entity {
    return new LibraryScrollV1Entity({
      scrollInputData: {
        ...structuredClone(this.dto),
        rented_by_character_id: null,
        rented_at: null,
        updated_at: new Date().toISOString(),
      },
    });
  }
}
