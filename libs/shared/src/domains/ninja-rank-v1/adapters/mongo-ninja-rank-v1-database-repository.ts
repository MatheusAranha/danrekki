import { Collection, Db } from 'mongodb';
import { NinjaRankV1DatabaseRepository } from '../core/database-repository';
import { INinjaRankV1Dto } from '../core/types';

type NinjaRankDoc = Omit<INinjaRankV1Dto, '_id'> & { _id: string };

export class MongoNinjaRankV1DatabaseRepository extends NinjaRankV1DatabaseRepository {
  private readonly collection: Collection<NinjaRankDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<NinjaRankDoc>('ninja_ranks');
  }

  async findById(id: string): Promise<INinjaRankV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as INinjaRankV1Dto) : null;
  }

  async findByName(name: string): Promise<INinjaRankV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as INinjaRankV1Dto) : null;
  }

  async findAll(): Promise<INinjaRankV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as INinjaRankV1Dto[];
  }

  async save(dto: INinjaRankV1Dto): Promise<INinjaRankV1Dto> {
    await this.collection.insertOne(dto as unknown as NinjaRankDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<INinjaRankV1Dto, 'name' | 'order' | 'updated_at'>>,
  ): Promise<INinjaRankV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as INinjaRankV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
