import { ClientSession, Collection, Db } from 'mongodb';
import { RepositorySession } from '../../../_shared/types';
import { DtTransactionV1DatabaseRepository } from '../core/database-repository';
import { IDtTransactionV1Dto } from '../core/types';

type DtTransactionDoc = Omit<IDtTransactionV1Dto, '_id'> & { _id: string };

export class MongoDtTransactionV1DatabaseRepository extends DtTransactionV1DatabaseRepository {
  private readonly collection: Collection<DtTransactionDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<DtTransactionDoc>('dt_transactions');
  }

  async findById(id: string): Promise<IDtTransactionV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as IDtTransactionV1Dto) : null;
  }

  async findByCharacterId(characterId: string): Promise<IDtTransactionV1Dto[]> {
    const docs = await this.collection.find({ character_id: characterId } as never).toArray();
    return docs as unknown as IDtTransactionV1Dto[];
  }

  async save(dto: IDtTransactionV1Dto, session?: RepositorySession): Promise<IDtTransactionV1Dto> {
    await this.collection.insertOne(dto as unknown as DtTransactionDoc, {
      session: session as unknown as ClientSession,
    });
    return dto;
  }
}
