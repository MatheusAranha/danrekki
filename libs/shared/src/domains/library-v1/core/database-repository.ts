import { ILibraryV1Dto } from './types';

export abstract class LibraryV1DatabaseRepository {
  abstract findById(id: string): Promise<ILibraryV1Dto | null>;
  abstract findByName(name: string): Promise<ILibraryV1Dto | null>;
  abstract findAll(): Promise<ILibraryV1Dto[]>;
  abstract save(dto: ILibraryV1Dto): Promise<ILibraryV1Dto>;
  abstract update(id: string, updates: Partial<Pick<ILibraryV1Dto, 'name' | 'description' | 'updated_at'>>): Promise<ILibraryV1Dto | null>;
  abstract delete(id: string): Promise<boolean>;
}
