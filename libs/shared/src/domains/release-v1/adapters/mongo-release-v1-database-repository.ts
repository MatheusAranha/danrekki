import { Collection, Db } from 'mongodb';
import { ReleaseV1DatabaseRepository } from '../core/database-repository';
import { IReleaseV1Dto } from '../core/types';

type ReleaseDoc = Omit<IReleaseV1Dto, '_id'> & { _id: string };

export class MongoReleaseV1DatabaseRepository extends ReleaseV1DatabaseRepository {
  private readonly collection: Collection<ReleaseDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<ReleaseDoc>('releases');
  }

  async findById(id: string): Promise<IReleaseV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as IReleaseV1Dto) : null;
  }

  async findByName(name: string): Promise<IReleaseV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as IReleaseV1Dto) : null;
  }

  async findAll(): Promise<IReleaseV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as IReleaseV1Dto[];
  }

  async save(dto: IReleaseV1Dto): Promise<IReleaseV1Dto> {
    await this.collection.insertOne(dto as unknown as ReleaseDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<IReleaseV1Dto, 'name' | 'updated_at'>>,
  ): Promise<IReleaseV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as IReleaseV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
