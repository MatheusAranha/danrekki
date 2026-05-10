import { Collection, Db } from 'mongodb';
import { LibraryV1DatabaseRepository } from '../core/database-repository';
import { ILibraryV1Dto } from '../core/types';

type LibraryDoc = Omit<ILibraryV1Dto, '_id'> & { _id: string };

export class MongoLibraryV1DatabaseRepository extends LibraryV1DatabaseRepository {
  private readonly collection: Collection<LibraryDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<LibraryDoc>('libraries');
  }

  async findById(id: string): Promise<ILibraryV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ILibraryV1Dto) : null;
  }

  async findByName(name: string): Promise<ILibraryV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as ILibraryV1Dto) : null;
  }

  async findAll(): Promise<ILibraryV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as ILibraryV1Dto[];
  }

  async save(dto: ILibraryV1Dto): Promise<ILibraryV1Dto> {
    await this.collection.insertOne(dto as unknown as LibraryDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<ILibraryV1Dto, 'name' | 'description' | 'updated_at'>>,
  ): Promise<ILibraryV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as ILibraryV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
