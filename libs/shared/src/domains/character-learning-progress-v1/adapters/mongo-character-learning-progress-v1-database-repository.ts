import { ClientSession, Collection, Db } from 'mongodb';
import { RepositorySession } from '../../../_shared/types';
import { CharacterLearningProgressV1DatabaseRepository } from '../core/database-repository';
import { ICharacterLearningProgressV1Dto } from '../core/types';

type CharacterLearningProgressDoc = Omit<ICharacterLearningProgressV1Dto, '_id'> & { _id: string };

export class MongoCharacterLearningProgressV1DatabaseRepository extends CharacterLearningProgressV1DatabaseRepository {
  private readonly collection: Collection<CharacterLearningProgressDoc>;

  constructor(db: Db) {
    super();
    this.collection = db.collection<CharacterLearningProgressDoc>('character_learning_progress');
  }

  async findById(id: string): Promise<ICharacterLearningProgressV1Dto | null> {
    const doc = await this.collection.findOne({ _id: id } as never);
    return doc ? (doc as unknown as ICharacterLearningProgressV1Dto) : null;
  }

  async findByCharacterId(characterId: string): Promise<ICharacterLearningProgressV1Dto[]> {
    const docs = await this.collection.find({ character_id: characterId } as never).toArray();
    return docs as unknown as ICharacterLearningProgressV1Dto[];
  }

  async findByCharacterAndContent(characterId: string, trainableContentId: string): Promise<ICharacterLearningProgressV1Dto | null> {
    const doc = await this.collection.findOne({
      character_id: characterId,
      trainable_content_id: trainableContentId,
    } as never);
    return doc ? (doc as unknown as ICharacterLearningProgressV1Dto) : null;
  }

  async save(dto: ICharacterLearningProgressV1Dto): Promise<ICharacterLearningProgressV1Dto> {
    await this.collection.insertOne(dto as unknown as CharacterLearningProgressDoc);
    return dto;
  }

  async update(
    id: string,
    updates: Partial<Pick<ICharacterLearningProgressV1Dto, 'dt_invested' | 'status' | 'completed_at' | 'updated_at'>>,
    session?: RepositorySession,
  ): Promise<ICharacterLearningProgressV1Dto | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as never,
      { $set: updates },
      { returnDocument: 'after', session: session as unknown as ClientSession },
    );
    return result ? (result as unknown as ICharacterLearningProgressV1Dto) : null;
  }
}
