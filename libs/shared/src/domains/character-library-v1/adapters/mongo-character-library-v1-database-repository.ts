import { Collection, Db } from 'mongodb';
import { CharacterLibraryV1DatabaseRepository } from '../core/database-repository';
import { ICharacterLibraryV1Dto } from '../core/types';

type CharacterLibraryDoc = Omit<ICharacterLibraryV1Dto, '_id'> & { _id: string };

export class MongoCharacterLibraryV1DatabaseRepository extends CharacterLibraryV1DatabaseRepository {
  private readonly collection: Collection<CharacterLibraryDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<CharacterLibraryDoc>('character_libraries');
  }

  async findById(id: string): Promise<ICharacterLibraryV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ICharacterLibraryV1Dto) : null;
  }

  async findByCharacterId(characterId: string): Promise<ICharacterLibraryV1Dto[]> {
    const docs = await this.collection.find({ character_id: characterId } as never).toArray();
    return docs as unknown as ICharacterLibraryV1Dto[];
  }

  async findByCharacterAndLibrary(characterId: string, libraryId: string): Promise<ICharacterLibraryV1Dto | null> {
    const doc = await this.collection.findOne({ character_id: characterId, library_id: libraryId } as never);
    return doc ? (doc as unknown as ICharacterLibraryV1Dto) : null;
  }

  async save(dto: ICharacterLibraryV1Dto): Promise<ICharacterLibraryV1Dto> {
    await this.collection.insertOne(dto as unknown as CharacterLibraryDoc);
    return dto;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
