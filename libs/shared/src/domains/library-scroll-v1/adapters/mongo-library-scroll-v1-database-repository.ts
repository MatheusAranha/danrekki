import { Collection, Db } from 'mongodb';
import { LibraryScrollV1DatabaseRepository } from '../core/database-repository';
import { ILibraryScrollV1Dto } from '../core/types';

type LibraryScrollDoc = Omit<ILibraryScrollV1Dto, '_id'> & { _id: string };

export class MongoLibraryScrollV1DatabaseRepository extends LibraryScrollV1DatabaseRepository {
  private readonly collection: Collection<LibraryScrollDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<LibraryScrollDoc>('library_scrolls');
  }

  async findById(id: string): Promise<ILibraryScrollV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ILibraryScrollV1Dto) : null;
  }

  async findByLibraryId(libraryId: string): Promise<ILibraryScrollV1Dto[]> {
    const docs = await this.collection.find({ library_id: libraryId } as never).toArray();
    return docs as unknown as ILibraryScrollV1Dto[];
  }

  async findByJutsuId(jutsuId: string): Promise<ILibraryScrollV1Dto[]> {
    const docs = await this.collection.find({ jutsu_id: jutsuId } as never).toArray();
    return docs as unknown as ILibraryScrollV1Dto[];
  }

  async save(dto: ILibraryScrollV1Dto): Promise<ILibraryScrollV1Dto> {
    await this.collection.insertOne(dto as unknown as LibraryScrollDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<ILibraryScrollV1Dto, 'jutsu_id' | 'required_ninja_rank_id' | 'rented_by_character_id' | 'rented_at' | 'updated_at'>>,
  ): Promise<ILibraryScrollV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as ILibraryScrollV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
