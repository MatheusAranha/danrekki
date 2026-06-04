import { Collection, Db } from 'mongodb';
import { SenseiV1DatabaseRepository } from '../core/database-repository';
import { ISenseiV1Dto } from '../core/types';

type SenseiDoc = Omit<ISenseiV1Dto, '_id'> & { _id: string };

export class MongoSenseiV1DatabaseRepository extends SenseiV1DatabaseRepository {
  private readonly collection: Collection<SenseiDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<SenseiDoc>('senseis');
  }

  async findById(id: string): Promise<ISenseiV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ISenseiV1Dto) : null;
  }

  async findByName(name: string): Promise<ISenseiV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as ISenseiV1Dto) : null;
  }

  async findAll(): Promise<ISenseiV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as ISenseiV1Dto[];
  }

  async save(dto: ISenseiV1Dto): Promise<ISenseiV1Dto> {
    await this.collection.insertOne(dto as unknown as SenseiDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<ISenseiV1Dto, 'name' | 'description' | 'picture_url' | 'updated_at'>>,
  ): Promise<ISenseiV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as ISenseiV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
