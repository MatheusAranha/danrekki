import { Collection, Db } from 'mongodb';
import { KeywordV1DatabaseRepository } from '../core/database-repository';
import { IKeywordV1Dto } from '../core/types';

type ReleaseDoc = Omit<IKeywordV1Dto, '_id'> & { _id: string };

export class MongoKeywordV1DatabaseRepository extends KeywordV1DatabaseRepository {
  private readonly collection: Collection<ReleaseDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<ReleaseDoc>('keywords');
  }

  async findById(id: string): Promise<IKeywordV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as IKeywordV1Dto) : null;
  }

  async findByName(name: string): Promise<IKeywordV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as IKeywordV1Dto) : null;
  }

  async findAll(): Promise<IKeywordV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as IKeywordV1Dto[];
  }

  async save(dto: IKeywordV1Dto): Promise<IKeywordV1Dto> {
    await this.collection.insertOne(dto as unknown as ReleaseDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<IKeywordV1Dto, 'name' | 'updated_at'>>,
  ): Promise<IKeywordV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as IKeywordV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
