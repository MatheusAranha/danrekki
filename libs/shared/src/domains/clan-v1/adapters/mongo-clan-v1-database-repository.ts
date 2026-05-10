import { Collection, Db } from 'mongodb';
import { ClanV1DatabaseRepository } from '../core/database-repository';
import { IClanV1Dto } from '../core/types';

type ClanDoc = Omit<IClanV1Dto, '_id'> & { _id: string };

export class MongoClanV1DatabaseRepository extends ClanV1DatabaseRepository {
  private readonly collection: Collection<ClanDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<ClanDoc>('clans');
  }

  async findById(id: string): Promise<IClanV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as IClanV1Dto) : null;
  }

  async findByName(name: string): Promise<IClanV1Dto | null> {
    const doc = await this.collection.findOne({ name } as never);
    return doc ? (doc as unknown as IClanV1Dto) : null;
  }

  async findAll(): Promise<IClanV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as IClanV1Dto[];
  }

  async save(dto: IClanV1Dto): Promise<IClanV1Dto> {
    await this.collection.insertOne(dto as unknown as ClanDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<IClanV1Dto, 'name' | 'dt_modifiers' | 'updated_at'>>,
  ): Promise<IClanV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as IClanV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
