import { Collection, Db } from 'mongodb';
import { SenseiContentV1DatabaseRepository } from '../core/database-repository';
import { ISenseiContentV1Dto } from '../core/types';

type SenseiContentDoc = Omit<ISenseiContentV1Dto, '_id'> & { _id: string };

export class MongoSenseiContentV1DatabaseRepository extends SenseiContentV1DatabaseRepository {
  private readonly collection: Collection<SenseiContentDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<SenseiContentDoc>('sensei_contents');
  }

  async findById(id: string): Promise<ISenseiContentV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ISenseiContentV1Dto) : null;
  }

  async findBySenseiId(senseiId: string): Promise<ISenseiContentV1Dto[]> {
    const docs = await this.collection.find({ sensei_id: senseiId } as never).toArray();
    return docs as unknown as ISenseiContentV1Dto[];
  }

  async findBySenseiAndContent(senseiId: string, trainableContentId: string): Promise<ISenseiContentV1Dto | null> {
    const doc = await this.collection.findOne({ sensei_id: senseiId, trainable_content_id: trainableContentId } as never);
    return doc ? (doc as unknown as ISenseiContentV1Dto) : null;
  }

  async save(dto: ISenseiContentV1Dto): Promise<ISenseiContentV1Dto> {
    await this.collection.insertOne(dto as unknown as SenseiContentDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<ISenseiContentV1Dto, 'required_proximity' | 'updated_at'>>,
  ): Promise<ISenseiContentV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as ISenseiContentV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
