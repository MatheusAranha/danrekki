import { Collection, Db } from 'mongodb';
import { JutsuRankV1DatabaseRepository } from '../core/database-repository';
import { IJutsuRankV1Dto } from '../core/types';

type JutsuRankDoc = Omit<IJutsuRankV1Dto, '_id'> & { _id: string };

export class MongoJutsuRankV1DatabaseRepository extends JutsuRankV1DatabaseRepository {
  private readonly collection: Collection<JutsuRankDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<JutsuRankDoc>('jutsu_ranks');
  }

  async findById(id: string): Promise<IJutsuRankV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as IJutsuRankV1Dto) : null;
  }

  async findByName(name: string): Promise<IJutsuRankV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as IJutsuRankV1Dto) : null;
  }

  async findByOrder(order: number): Promise<IJutsuRankV1Dto | null> {
    const doc = await this.collection.findOne({ order } as never);
    return doc ? (doc as unknown as IJutsuRankV1Dto) : null;
  }

  async findAll(): Promise<IJutsuRankV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as IJutsuRankV1Dto[];
  }

  async save(dto: IJutsuRankV1Dto): Promise<IJutsuRankV1Dto> {
    await this.collection.insertOne(dto as unknown as JutsuRankDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<IJutsuRankV1Dto, 'name' | 'order' | 'dt_cost' | 'updated_at'>>,
  ): Promise<IJutsuRankV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as IJutsuRankV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
