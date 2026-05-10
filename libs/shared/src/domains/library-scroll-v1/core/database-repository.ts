import { ILibraryScrollV1Dto } from './types';

export abstract class LibraryScrollV1DatabaseRepository {
  abstract findById(id: string): Promise<ILibraryScrollV1Dto | null>;
  abstract findByLibraryId(libraryId: string): Promise<ILibraryScrollV1Dto[]>;
  abstract findByJutsuId(jutsuId: string): Promise<ILibraryScrollV1Dto[]>;
  abstract save(dto: ILibraryScrollV1Dto): Promise<ILibraryScrollV1Dto>;
  abstract update(id: string, updates: Partial<Pick<ILibraryScrollV1Dto, 'jutsu_id' | 'required_ninja_rank_id' | 'rented_by_character_id' | 'rented_at' | 'updated_at'>>): Promise<ILibraryScrollV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
