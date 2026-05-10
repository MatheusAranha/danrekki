import { Collection, Db } from 'mongodb';
import { TrainableContentV1DatabaseRepository } from '../core/database-repository';
import { ITrainableContentV1Dto } from '../core/types';

type TrainableContentDoc = Omit<ITrainableContentV1Dto, '_id'> & { _id: string };

export class MongoTrainableContentV1DatabaseRepository extends TrainableContentV1DatabaseRepository {
  private readonly collection: Collection<TrainableContentDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<TrainableContentDoc>('trainable_contents');
  }

  async findById(id: string): Promise<ITrainableContentV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ITrainableContentV1Dto) : null;
  }

  async findByJutsuId(jutsuId: string): Promise<ITrainableContentV1Dto | null> {
    const doc = await this.collection.findOne({ jutsu_id: jutsuId } as never);
    return doc ? (doc as unknown as ITrainableContentV1Dto) : null;
  }

  async findAll(): Promise<ITrainableContentV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as ITrainableContentV1Dto[];
  }

  async save(dto: ITrainableContentV1Dto): Promise<ITrainableContentV1Dto> {
    await this.collection.insertOne(dto as unknown as TrainableContentDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<ITrainableContentV1Dto, 'name' | 'description' | 'base_dt_cost' | 'updated_at'>>,
  ): Promise<ITrainableContentV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as ITrainableContentV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
