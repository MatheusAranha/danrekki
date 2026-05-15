import { Collection, Db } from 'mongodb';
import { JutsuV1DatabaseRepository } from '../core/database-repository';
import { IJutsuV1Dto } from '../core/types';

type JutsuDoc = Omit<IJutsuV1Dto, '_id'> & { _id: string };

export class MongoJutsuV1DatabaseRepository extends JutsuV1DatabaseRepository {
  private readonly collection: Collection<JutsuDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<JutsuDoc>('jutsus');
  }

  async findById(id: string): Promise<IJutsuV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as IJutsuV1Dto) : null;
  }

  async findByName(name: string): Promise<IJutsuV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as IJutsuV1Dto) : null;
  }

  async findByReleaseId(releaseId: string): Promise<IJutsuV1Dto[]> {
    const docs = await this.collection.find({ release_id: releaseId } as never).toArray();
    return docs as unknown as IJutsuV1Dto[];
  }

  async findByJutsuRankId(jutsuRankId: string): Promise<IJutsuV1Dto[]> {
    const docs = await this.collection.find({ jutsu_rank_id: jutsuRankId } as never).toArray();
    return docs as unknown as IJutsuV1Dto[];
  }

  async findAll(): Promise<IJutsuV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as IJutsuV1Dto[];
  }

  async save(dto: IJutsuV1Dto): Promise<IJutsuV1Dto> {
    await this.collection.insertOne(dto as unknown as JutsuDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<IJutsuV1Dto, 'name' | 'jutsu_rank_id' | 'release_id' | 'elements' | 'components' | 'duration' | 'description' | 'updated_at'>>,
  ): Promise<IJutsuV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as IJutsuV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
