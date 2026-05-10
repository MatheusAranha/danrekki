import { Collection, Db } from 'mongodb';
import { UserV1DatabaseRepository } from '../core/database-repository';
import { IUserV1Dto } from '../core/types';

type UserDoc = Omit<IUserV1Dto, '_id'> & { _id: string };

export class MongoUserV1DatabaseRepository extends UserV1DatabaseRepository {
  private readonly collection: Collection<UserDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<UserDoc>('users');
  }

  async findById(id: string): Promise<IUserV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as IUserV1Dto) : null;
  }

  async findByEmail(email: string): Promise<IUserV1Dto | null> {
    const doc = await this.collection.findOne({ email } as never);
    return doc ? (doc as unknown as IUserV1Dto) : null;
  }

  async findAll(): Promise<IUserV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as IUserV1Dto[];
  }

  async save(dto: IUserV1Dto): Promise<IUserV1Dto> {
    await this.collection.insertOne(dto as unknown as UserDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<IUserV1Dto, 'email' | 'role' | 'password_hash' | 'updated_at'>>,
  ): Promise<IUserV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after' },
    );
    return result ? (result as unknown as IUserV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
