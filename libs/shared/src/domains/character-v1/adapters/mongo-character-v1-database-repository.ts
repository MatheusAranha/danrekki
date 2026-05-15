import { ClientSession, Collection, Db } from 'mongodb';
import { RepositorySession } from '../../../_shared/types';
import { CharacterV1DatabaseRepository } from '../core/database-repository';
import { ICharacterV1Dto } from '../core/types';

type CharacterDoc = Omit<ICharacterV1Dto, '_id'> & { _id: string };

export class MongoCharacterV1DatabaseRepository extends CharacterV1DatabaseRepository {
  private readonly collection: Collection<CharacterDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<CharacterDoc>('characters');
  }

  async findById(id: string): Promise<ICharacterV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ICharacterV1Dto) : null;
  }

  async findByUserId(userId: string): Promise<ICharacterV1Dto[]> {
    const docs = await this.collection.find({ user_id: userId } as never).toArray();
    return docs as unknown as ICharacterV1Dto[];
  }

  async findAll(): Promise<ICharacterV1Dto[]> {
    const docs = await this.collection.find({}).toArray();
    return docs as unknown as ICharacterV1Dto[];
  }

  async save(dto: ICharacterV1Dto): Promise<ICharacterV1Dto> {
    await this.collection.insertOne(dto as unknown as CharacterDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<ICharacterV1Dto, 'name' | 'clan_id' | 'available_dt' | 'updated_at'>>,
    session?: RepositorySession,
  ): Promise<ICharacterV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after', session: session as unknown as ClientSession },
    );
    return result ? (result as unknown as ICharacterV1Dto) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as never);
    return result.deletedCount === 1;
  }
}
